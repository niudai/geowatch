import { auth } from '@/auth';
import { db } from '@/lib/db';
import { apps, keywords, monitoringResults, monitoringTasks } from '@/lib/schema';
import { eq, and, count } from 'drizzle-orm';
import { queryGoogleAIMode, queryChatGPT, detectMention } from '@/lib/monitoring';
import { getUserSubscription, isActiveSubscription } from '@/lib/subscription';
import { FREE_LIMITS } from '@/lib/plans';

export async function POST(req: Request, { params }: { params: Promise<{ appId: string }> }) {
  const { appId } = await params;
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify ownership
  const app = await db.select().from(apps).where(eq(apps.id, appId)).limit(1);
  if (!app[0] || app[0].userId !== session.user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Check subscription — paid users must have active subscription
  const sub = await getUserSubscription(session.user.id);
  if (sub?.plan && !isActiveSubscription(sub.status)) {
    return Response.json(
      { error: 'Your subscription is inactive. Please update your billing to continue monitoring.', code: 'SUBSCRIPTION_INACTIVE' },
      { status: 403 }
    );
  }

  // Get all keywords
  const appKeywords = await db
    .select()
    .from(keywords)
    .where(and(eq(keywords.appId, appId), eq(keywords.status, 'active')));

  const brandName = app[0].name; // Use app name as brand for mention detection
  const results = [];

  for (const kw of appKeywords) {
    const query = kw.keyword;

    // Google AI Mode
    try {
      const googleResult = await queryGoogleAIMode(query);
      const { mentioned: gMentioned, text: gText } = detectMention(googleResult.response, brandName);

      // Delete old result for this keyword+source before inserting
      await db.delete(monitoringResults).where(
        and(
          eq(monitoringResults.keywordId, kw.id),
          eq(monitoringResults.source, 'google_ai_mode')
        )
      );

      const [savedGoogleResult] = await db
        .insert(monitoringResults)
        .values({
          appId,
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
    } catch (error) {
      console.error(`[Monitoring] Google AI Mode error for "${query}":`, error);
    }

    // ChatGPT
    try {
      const chatGPTResult = await queryChatGPT(query);
      const { mentioned: cMentioned, text: cText } = detectMention(chatGPTResult.response, brandName);

      // Delete old result for this keyword+source before inserting
      await db.delete(monitoringResults).where(
        and(
          eq(monitoringResults.keywordId, kw.id),
          eq(monitoringResults.source, 'chatgpt')
        )
      );

      const [savedChatResult] = await db
        .insert(monitoringResults)
        .values({
          appId,
          keywordId: kw.id,
          source: 'chatgpt',
          queryText: query,
          aiResponse: chatGPTResult.response,
          mentionedInResponse: cMentioned,
          sentiment: 'neutral',
          links: chatGPTResult.links ? JSON.stringify(chatGPTResult.links) : null,
          mentionText: cText || undefined,
        })
        .returning();

      results.push(savedChatResult);
    } catch (error) {
      console.error(`[Monitoring] ChatGPT error for "${query}":`, error);
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
