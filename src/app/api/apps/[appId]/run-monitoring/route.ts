import { auth } from '@/auth';
import { db } from '@/lib/db';
import { apps, keywords, monitoringResults, monitoringTasks } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { queryGoogleAIMode, queryChatGPT, generateQueries, detectMention } from '@/lib/monitoring';

export async function POST(req: Request, { params }: { params: { appId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify ownership
  const app = await db.select().from(apps).where(eq(apps.id, params.appId)).limit(1);
  if (!app[0] || app[0].userId !== session.user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Get all keywords
  const appKeywords = await db
    .select()
    .from(keywords)
    .where(and(eq(keywords.appId, params.appId), eq(keywords.status, 'active')));

  const results = [];

  for (const kw of appKeywords) {
    const queries = generateQueries(kw.keyword);

    for (const query of queries) {
      try {
        // Run Google AI Mode
        const googleResult = await queryGoogleAIMode(query);
        const { mentioned: gMentioned, text: gText } = detectMention(googleResult.response, kw.keyword);

        const [savedGoogleResult] = await db
          .insert(monitoringResults)
          .values({
            appId: params.appId,
            keywordId: kw.id,
            source: 'google_ai_mode',
            queryText: query,
            aiResponse: googleResult.response,
            mentionedInResponse: gMentioned,
            sentiment: 'neutral',
            citations: googleResult.citations ? JSON.stringify(googleResult.citations) : null,
            links: googleResult.links ? JSON.stringify(googleResult.links) : null,
            mentionText: gText || undefined,
          })
          .returning();

        results.push(savedGoogleResult);

        // Run ChatGPT
        const chatGPTResult = await queryChatGPT(query);
        const { mentioned: cMentioned, text: cText } = detectMention(chatGPTResult.response, kw.keyword);

        const [savedChatResult] = await db
          .insert(monitoringResults)
          .values({
            appId: params.appId,
            keywordId: kw.id,
            source: 'chatgpt',
            queryText: query,
            aiResponse: chatGPTResult.response,
            mentionedInResponse: cMentioned,
            sentiment: 'neutral',
            mentionText: cText || undefined,
          })
          .returning();

        results.push(savedChatResult);
      } catch (error) {
        console.error(`[Monitoring] Error for keyword "${kw.keyword}":`, error);
      }
    }

    // Update last checked time
    await db
      .update(keywords)
      .set({ lastCheckedAt: new Date() })
      .where(eq(keywords.id, kw.id));
  }

  return Response.json({
    status: 'completed',
    results: results.length,
    totalChecked: appKeywords.length,
  });
}
