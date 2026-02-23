import axios from 'axios';
import puppeteer from 'puppeteer-core';

const OXYLABS_API = 'https://realtime.oxylabs.io/v1/queries';

// CDP ports to try when connecting to local anti-detect browser
const CDP_PORTS = [9222, 9223, 9224, 9225, 9226];

// Types
export interface MonitoringResult {
  source: 'google_ai_mode' | 'chatgpt';
  query: string;
  response: string;
  mentioned: boolean;
  sentiment?: 'positive' | 'negative' | 'neutral';
  citations?: Array<{ text: string; urls: string[] }>;
  links?: Array<{ text: string; url: string }>;
  mentionText?: string;
  error?: string;
}

// ─────────────────────────────────────────────────────────────────────────
// Google AI Mode (via Oxylabs)
// ─────────────────────────────────────────────────────────────────────────

export async function queryGoogleAIMode(query: string): Promise<MonitoringResult> {
  const username = process.env.OXYLABS_USERNAME;
  const password = process.env.OXYLABS_PASSWORD;

  if (!username || !password) {
    throw new Error('Oxylabs credentials not configured');
  }

  try {
    console.log(`[Google AI Mode] Querying: "${query}"`);

    const response = await axios.post(
      OXYLABS_API,
      {
        source: 'google_ai_mode',
        query: query.substring(0, 400),
        render: 'html',
        parse: true,
      },
      {
        auth: { username, password },
        timeout: 120000,
      }
    );

    const result = response.data.results?.[0];

    if (!result) {
      throw new Error('No results from Google AI Mode');
    }

    if (result.status_code && result.status_code !== 200) {
      throw new Error(`Oxylabs error ${result.status_code}`);
    }

    const content = result.content || {};

    return {
      source: 'google_ai_mode',
      query,
      response: content.response_text || '',
      mentioned: (content.response_text || '').length > 0,
      citations: content.citations || [],
      links: content.links || [],
    };
  } catch (error) {
    console.error('[Google AI Mode] Error:', error);
    return {
      source: 'google_ai_mode',
      query,
      response: '',
      mentioned: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────
// ChatGPT (via local anti-detect browser + Puppeteer CDP)
// ─────────────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// Wait for ChatGPT response to finish streaming
async function waitForChatGPTResponse(page: any, timeoutMs = 180000): Promise<string> {
  const startTime = Date.now();

  await page.waitForSelector('[data-message-author-role="assistant"]', {
    timeout: timeoutMs,
  });

  let lastLength = 0;
  let stableCount = 0;
  while (Date.now() - startTime < timeoutMs) {
    const isStreaming = await page.evaluate(() => {
      return !!document.querySelector('button[aria-label="Stop generating"]');
    });

    if (!isStreaming) {
      const currentLength = await page.evaluate(() => {
        const msgs = document.querySelectorAll('[data-message-author-role="assistant"]');
        if (msgs.length === 0) return 0;
        return msgs[msgs.length - 1]?.textContent?.length || 0;
      });

      if (currentLength === lastLength && currentLength > 0) {
        stableCount++;
        if (stableCount >= 5) break;
      } else {
        stableCount = 0;
      }
      lastLength = currentLength;
    }

    await sleep(500);
  }

  await sleep(1500);

  const responseText = await page.evaluate(() => {
    const messages = document.querySelectorAll('[data-message-author-role="assistant"]');
    if (messages.length === 0) return '';
    return messages[messages.length - 1]?.textContent?.trim() || '';
  });

  return responseText;
}

// Extract cited sources from ChatGPT response
// Strategy: extract inline citation pills (data-testid="webpage-citation-pill") directly,
// then click Sources to open the side panel and extract full links from there.
async function extractChatGPTSources(
  page: any,
  conversationUrl: string,
  connectPort: number
): Promise<Array<{ text: string; url: string; domain: string }>> {
  // Scroll to bottom of response to ensure all citations are rendered
  await page.evaluate(() => {
    const msgs = document.querySelectorAll('[data-message-author-role="assistant"]');
    if (msgs.length > 0) msgs[msgs.length - 1].scrollIntoView({ block: 'end', behavior: 'smooth' });
  });
  await sleep(1500);

  // Strategy 1: Extract inline citation pill links directly from the response
  // These have data-testid="webpage-citation-pill" and contain <a href="..."> tags
  let sources = await page.evaluate(() => {
    const results: Array<{ text: string; url: string; domain: string }> = [];
    const seen = new Set<string>();
    const msgs = document.querySelectorAll('[data-message-author-role="assistant"]');
    if (msgs.length === 0) return results;
    const lastMsg = msgs[msgs.length - 1];

    // Get citation pills
    lastMsg.querySelectorAll('[data-testid="webpage-citation-pill"] a[href^="http"]').forEach((a: any) => {
      const url = (a.getAttribute('href') || '').replace(/[?&]utm_source=chatgpt\.com/, '');
      let hostname = '';
      try { hostname = new URL(url).hostname; } catch { return; }
      if (hostname.includes('chatgpt.com') || hostname.includes('openai.com')) return;
      if (!seen.has(hostname)) {
        seen.add(hostname);
        const text = a.textContent?.trim()?.replace(/\+\d+$/, '').trim() || hostname;
        results.push({ text: text.substring(0, 120), url, domain: hostname });
      }
    });

    return results;
  });

  if (sources.length > 0) {
    console.log(`[ChatGPT] Extracted ${sources.length} sources from inline citation pills`);
    return sources;
  }

  // Strategy 2: Click Sources button and extract from the side panel
  const hasBtn = await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Sources"]') as HTMLElement;
    if (btn) { btn.click(); return true; }
    return false;
  });

  if (!hasBtn) {
    // Strategy 3: Fallback — extract domains from favicon images
    return page.evaluate(() => {
      const results: Array<{ text: string; url: string; domain: string }> = [];
      const seen = new Set<string>();
      document.querySelectorAll('img[src*="s2/favicons"]').forEach((img: any) => {
        const src = img.getAttribute('src') || '';
        const match = src.match(/domain=([^&]+)/);
        if (match) {
          const domain = match[1].replace('https://', '').replace('http://', '');
          if (!seen.has(domain)) {
            seen.add(domain);
            results.push({ text: domain, url: `https://${domain}`, domain });
          }
        }
      });
      return results;
    });
  }

  // Wait for the side panel to render with links
  for (let i = 0; i < 16; i++) {
    await sleep(500);
    const count = await page.evaluate(() => {
      // The side panel is a div positioned on the right, not a [role="dialog"]
      // Look for external links anywhere on page that weren't in the message area
      const msgs = document.querySelectorAll('[data-message-author-role="assistant"]');
      const msgEl = msgs.length ? msgs[msgs.length - 1] : null;
      let total = 0;
      document.querySelectorAll('a[href^="http"]').forEach((a: any) => {
        if (msgEl && msgEl.contains(a)) return; // skip links inside message
        try {
          const h = new URL(a.getAttribute('href') || '').hostname;
          if (!h.includes('chatgpt.com') && !h.includes('openai.com') && !h.includes('oaiusercontent') && !h.includes('auth0.com')) total++;
        } catch {}
      });
      return total;
    });
    if (count > 0) break;
  }

  // Extract links from the side panel (any external links NOT inside the assistant message)
  sources = await page.evaluate(() => {
    const results: Array<{ text: string; url: string; domain: string }> = [];
    const seen = new Set<string>();
    const msgs = document.querySelectorAll('[data-message-author-role="assistant"]');
    const msgEl = msgs.length ? msgs[msgs.length - 1] : null;

    document.querySelectorAll('a[href^="http"]').forEach((a: any) => {
      if (msgEl && msgEl.contains(a)) return;
      let url = a.getAttribute('href') || '';
      let hostname = '';
      try { hostname = new URL(url).hostname; } catch { return; }
      if (hostname.includes('chatgpt.com') || hostname.includes('openai.com') ||
          hostname.includes('oaiusercontent') || hostname.includes('auth0.com')) return;
      url = url.replace(/[?&]utm_source=chatgpt\.com/, '');
      if (!seen.has(url)) {
        seen.add(url);
        const text = a.textContent?.trim() || '';
        results.push({ text: text.substring(0, 120), url, domain: hostname });
      }
    });

    return results;
  });

  // Close the panel
  await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Sources"]') as HTMLElement;
    if (btn) btn.click();
  });
  await sleep(300);

  console.log(`[ChatGPT] Extracted ${sources.length} sources from side panel`);
  return sources;
}

export async function queryChatGPT(query: string): Promise<MonitoringResult> {
  let browser: any = null;
  let page: any = null;
  let connectedPort = 9222;

  try {
    console.log(`[ChatGPT] Querying: "${query}"`);

    // 1. Connect to local browser
    for (const port of CDP_PORTS) {
      try {
        browser = await puppeteer.connect({
          browserURL: `http://127.0.0.1:${port}`,
          protocolTimeout: 60000,
        });
        connectedPort = port;
        console.log(`[ChatGPT] Connected on port ${port}`);
        break;
      } catch {}
    }
    if (!browser) {
      throw new Error('No local browser found. Launch with: pnpm tsx scripts/open-browser-profile.ts');
    }

    // 2. Open new tab
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    // 3. Navigate to ChatGPT
    console.log('[ChatGPT] Navigating to chatgpt.com...');
    await page.goto('https://chatgpt.com', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    // Check login status
    await sleep(2000);
    const isLoggedIn = await page.evaluate(() => {
      const loginBtn = Array.from(document.querySelectorAll('button, a')).find(
        (el) => el.textContent?.trim() === 'Log in'
      );
      return !loginBtn;
    });
    if (!isLoggedIn) {
      throw new Error('Not logged in to ChatGPT. Run open-browser-profile.ts and login first.');
    }

    // 4. Type and submit query
    const textareaSelector = '#prompt-textarea, div[contenteditable="true"][id="prompt-textarea"]';
    await page.waitForSelector(textareaSelector, { timeout: 15000 });
    await page.click(textareaSelector);
    await page.type(textareaSelector, query, { delay: 15 });
    await sleep(500);
    await page.keyboard.press('Enter');
    console.log('[ChatGPT] Query submitted, waiting for response...');

    // 5. Wait for response
    const responseText = await waitForChatGPTResponse(page, 180000);
    console.log(`[ChatGPT] Response: ${responseText.length} chars`);

    // 6. Extract sources (with reconnection fallback)
    const conversationUrl = page.url();
    let sources = await extractChatGPTSources(page, conversationUrl, connectedPort);

    if (sources.length === 0 && conversationUrl.includes('/c/')) {
      console.log('[ChatGPT] Retrying source extraction via reconnection...');
      // Close the page before disconnecting to avoid orphan tabs
      try { await page.close(); } catch {}
      page = null;
      browser.disconnect();
      await sleep(1000);

      browser = await puppeteer.connect({
        browserURL: `http://127.0.0.1:${connectedPort}`,
        protocolTimeout: 60000,
      });
      const allPages = await browser.pages();
      const targetPage = allPages.find((p: any) => p.url() === conversationUrl);
      if (targetPage) {
        page = targetPage; // Track for cleanup
        sources = await extractChatGPTSources(targetPage, conversationUrl, connectedPort);
      }
    }

    console.log(`[ChatGPT] Sources: ${sources.length}`);

    // 7. Close the conversation tab
    try {
      if (page && !page.isClosed()) await page.close();
      page = null;
    } catch {}

    // Convert sources to links format
    const links = sources.map((s) => ({ text: s.text, url: s.url, domain: s.domain }));

    return {
      source: 'chatgpt',
      query,
      response: responseText.substring(0, 10000),
      mentioned: responseText.length > 0,
      links,
    };
  } catch (error) {
    console.error('[ChatGPT] Error:', error);
    return {
      source: 'chatgpt',
      query,
      response: '',
      mentioned: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  } finally {
    // Always close the tab to prevent tab accumulation
    if (page) {
      try {
        if (!page.isClosed()) await page.close();
      } catch {}
    }
    if (browser) {
      try {
        browser.disconnect();
      } catch {}
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Mention detection (simple version, can be enhanced with LLM)
// ─────────────────────────────────────────────────────────────────────────

export function detectMention(response: string, brandName: string): {
  mentioned: boolean;
  text: string;
} {
  const lowerResponse = response.toLowerCase();
  const lowerBrand = brandName.toLowerCase();

  if (lowerResponse.includes(lowerBrand)) {
    const idx = lowerResponse.indexOf(lowerBrand);
    const start = Math.max(0, idx - 100);
    const end = Math.min(response.length, idx + lowerBrand.length + 100);
    const text = response.substring(start, end);

    return { mentioned: true, text };
  }

  return { mentioned: false, text: '' };
}
