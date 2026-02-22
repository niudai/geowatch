import axios from 'axios';

const OXYLABS_API = 'https://realtime.oxylabs.io/v1/queries';
const GEELARK_API = 'https://api.geelark.com';

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
        query: query.substring(0, 400), // API limit
        render: 'html',
        parse: true,
      },
      {
        auth: {
          username,
          password,
        },
        timeout: 120000, // 2 min timeout
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
// ChatGPT (via Geelark)
// ─────────────────────────────────────────────────────────────────────────

let cachedProfile: { id: string } | null = null;

async function getOrCreateProfile(): Promise<string> {
  const token = process.env.GEELARK_BEARER_TOKEN;
  if (!token) throw new Error('Geelark token not configured');

  // Reuse profile to save time
  if (cachedProfile) {
    return cachedProfile.id;
  }

  try {
    const response = await axios.post(
      `${GEELARK_API}/v1/profiles`,
      {
        name: `geowatch-monitor-${Date.now()}`,
        browser: 'chromium',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    cachedProfile = response.data;
    return response.data.id;
  } catch (error) {
    console.error('[Geelark] Profile creation failed:', error);
    throw error;
  }
}

async function launchSession(profileId: string): Promise<{ id: string; wsUrl: string }> {
  const token = process.env.GEELARK_BEARER_TOKEN;
  if (!token) throw new Error('Geelark token not configured');

  const response = await axios.post(
    `${GEELARK_API}/v1/sessions`,
    {
      profile_id: profileId,
      timeout: 120,
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return {
    id: response.data.id,
    wsUrl: response.data.ws_url,
  };
}

async function closeSession(sessionId: string): Promise<void> {
  const token = process.env.GEELARK_BEARER_TOKEN;
  if (!token) return;

  try {
    await axios.delete(`${GEELARK_API}/v1/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error('[Geelark] Session close failed:', error);
  }
}

interface WSMessage {
  method: string;
  params?: Record<string, any>;
}

function sendWSMessage(ws: any, message: WSMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('WS message timeout'));
    }, 10000);

    const handler = (data: any) => {
      clearTimeout(timeout);
      ws.removeListener('message', handler);
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve(data);
      }
    };

    ws.on('message', handler);
    ws.send(JSON.stringify(message));
  });
}

export async function queryChatGPT(query: string): Promise<MonitoringResult> {
  const WebSocket = require('ws');

  try {
    console.log(`[ChatGPT] Querying: "${query}"`);

    // Get or create profile
    const profileId = await getOrCreateProfile();

    // Launch session
    const session = await launchSession(profileId);

    // Connect WebSocket
    const ws = new WebSocket(session.wsUrl);
    await new Promise((resolve) => ws.once('open', resolve));

    try {
      // Navigate to ChatGPT
      await sendWSMessage(ws, {
        method: 'Page.navigate',
        params: { url: 'https://chatgpt.com' },
      });

      // Wait for UI
      await new Promise((r) => setTimeout(r, 3000));

      // Find textarea and type query
      await sendWSMessage(ws, {
        method: 'Input.insertText',
        params: {
          text: query,
          selector: 'textarea[placeholder*="Message"], textarea[data-placeholder*="message"]',
        },
      });

      // Press Enter
      await sendWSMessage(ws, {
        method: 'Input.press',
        params: { key: 'Enter' },
      });

      // Wait for response
      await new Promise((r) => setTimeout(r, 5000));

      // Get page content
      const contentMsg = await sendWSMessage(ws, {
        method: 'Page.getContent',
        params: {},
      });

      const html = contentMsg.result?.content || '';

      // Extract AI response (simple heuristic)
      // In production, use Claude to parse HTML
      const responseMatch = html.match(/<div[^>]*role="article"[^>]*>([\s\S]*?)<\/div>/);
      const response = responseMatch ? responseMatch[1] : '';

      return {
        source: 'chatgpt',
        query,
        response: response.substring(0, 5000), // Limit size
        mentioned: response.length > 0,
      };
    } finally {
      ws.close();
      await closeSession(session.id);
    }
  } catch (error) {
    console.error('[ChatGPT] Error:', error);
    return {
      source: 'chatgpt',
      query,
      response: '',
      mentioned: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Keyword expansion (generate related queries)
// ─────────────────────────────────────────────────────────────────────────

export function generateQueries(keyword: string): string[] {
  const templates = [
    `what is ${keyword}`,
    `${keyword} vs alternatives`,
    `${keyword} features and benefits`,
    `best ${keyword}`,
    `${keyword} reviews`,
  ];

  return templates.map((t) => t.replace(/\s+/g, ' ').trim());
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
    // Extract surrounding context
    const idx = lowerResponse.indexOf(lowerBrand);
    const start = Math.max(0, idx - 100);
    const end = Math.min(response.length, idx + lowerBrand.length + 100);
    const text = response.substring(start, end);

    return {
      mentioned: true,
      text,
    };
  }

  return {
    mentioned: false,
    text: '',
  };
}
