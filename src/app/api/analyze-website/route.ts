import { auth } from '@/auth';
import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';

export const maxDuration = 60;

function stripHtml(html: string): string {
  // Remove script, style, nav, footer, header tags and their content
  let text = html.replace(/<(script|style|nav|footer|header|noscript|svg)[^>]*>[\s\S]*?<\/\1>/gi, ' ');
  // Remove all HTML tags
  text = text.replace(/<[^>]+>/g, ' ');
  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
  // Collapse whitespace
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}

function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  // Ensure it's a valid URL
  try {
    new URL(url);
  } catch {
    throw new Error(`Invalid URL: ${input}`);
  }
  return url;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { url: rawUrl } = await req.json();
  if (!rawUrl) return Response.json({ error: 'URL required' }, { status: 400 });

  let url: string;
  try {
    url = normalizeUrl(rawUrl);
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : 'Invalid URL' }, { status: 400 });
  }

  const oxylabsUsername = process.env.OXYLABS_USERNAME;
  const oxylabsPassword = process.env.OXYLABS_PASSWORD;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!oxylabsUsername || !oxylabsPassword) {
    return Response.json({ error: 'Oxylabs credentials not configured' }, { status: 500 });
  }
  if (!anthropicKey) {
    return Response.json({ error: 'Anthropic API key not configured' }, { status: 500 });
  }

  try {
    // 1. Fetch the website via Oxylabs
    console.log(`[analyze-website] Fetching: ${url}`);
    const oxResponse = await axios.post(
      'https://realtime.oxylabs.io/v1/queries',
      {
        source: 'universal',
        url,
      },
      {
        auth: { username: oxylabsUsername, password: oxylabsPassword },
        timeout: 45000,
      }
    );

    const rawHtml = oxResponse.data.results?.[0]?.content || '';
    const pageText = stripHtml(rawHtml).substring(0, 8000);

    if (pageText.length < 50) {
      return Response.json({ error: 'Could not extract meaningful content from the website' }, { status: 422 });
    }

    // 2. Analyze with Claude
    console.log(`[analyze-website] Analyzing with Claude (${pageText.length} chars)...`);
    const anthropic = new Anthropic({ apiKey: anthropicKey });

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `Analyze this product/service website content and generate a structured profile. Return ONLY valid JSON, no other text.

Website content:
${pageText}

Return this exact JSON structure:
{
  "whatItDoes": "One paragraph describing what the product/service does",
  "targetAudience": "One paragraph describing who the target audience is",
  "keyBenefits": ["benefit1", "benefit2", "benefit3", "benefit4", "benefit5"],
  "useCases": ["use case 1", "use case 2", "use case 3", "use case 4", "use case 5"],
  "uniqueSellingPoints": ["USP 1", "USP 2", "USP 3"],
  "competitors": [
    {"name": "Competitor Name", "description": "Brief description of what they do"},
    ... (5 real competitors)
  ],
  "monitoringKeywords": [
    "natural language search query that someone would type into Google or ChatGPT when looking for this type of product",
    ... (10 keywords total)
  ]
}

IMPORTANT:
- monitoringKeywords must be NATURAL LANGUAGE SEARCH QUERIES, not brand names. Example: "best database GUI tool for PostgreSQL" not "DbVisualizer"
- competitors must be REAL companies/products that compete in the same space
- All arrays should have the exact number of items specified`
        }
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse the JSON from Claude's response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json({ error: 'Failed to parse AI analysis' }, { status: 500 });
    }

    const profile = JSON.parse(jsonMatch[0]);

    return Response.json({ profile });
  } catch (error: unknown) {
    console.error('[analyze-website] Error:', error);
    // Extract Oxylabs error details if available
    if (axios.isAxiosError(error) && error.response) {
      console.error('[analyze-website] Oxylabs response:', error.response.status, JSON.stringify(error.response.data));
      return Response.json({
        error: `Website fetch failed (${error.response.status}): ${JSON.stringify(error.response.data?.message || error.response.data)}`,
      }, { status: 500 });
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: `Analysis failed: ${message}` }, { status: 500 });
  }
}
