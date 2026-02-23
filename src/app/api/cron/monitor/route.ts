import { db } from '@/lib/db';
import { apps, keywords, monitoringResults, subscriptions } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { queryGoogleAIMode, detectMention } from '@/lib/monitoring';
import { getUserSubscription, isActiveSubscription } from '@/lib/subscription';

export const maxDuration = 300;

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('[Cron] Starting daily monitoring...');

  // Get all active apps
  const allApps = await db
    .select()
    .from(apps)
    .where(eq(apps.status, 'active'));

  let totalChecked = 0;
  let totalResults = 0;
  const errors: string[] = [];

  for (const app of allApps) {
    // Skip apps whose owners have inactive paid subscriptions
    const sub = await getUserSubscription(app.userId);
    if (sub?.plan && !isActiveSubscription(sub.status)) {
      console.log(`[Cron] Skipping app "${app.name}" — subscription inactive (${sub.status})`);
      continue;
    }

    const appKeywords = await db
      .select()
      .from(keywords)
      .where(and(eq(keywords.appId, app.id), eq(keywords.status, 'active')));

    const brandName = app.name;

    for (const kw of appKeywords) {
      try {
        // Only run Google AI Mode (ChatGPT needs local browser)
        const googleResult = await queryGoogleAIMode(kw.keyword);
        const { mentioned, text: mentionText } = detectMention(googleResult.response, brandName);

        // Delete old result for this keyword+source
        await db.delete(monitoringResults).where(
          and(
            eq(monitoringResults.keywordId, kw.id),
            eq(monitoringResults.source, 'google_ai_mode')
          )
        );

        await db.insert(monitoringResults).values({
          appId: app.id,
          keywordId: kw.id,
          source: 'google_ai_mode',
          queryText: kw.keyword,
          aiResponse: googleResult.response,
          mentionedInResponse: mentioned,
          sentiment: 'neutral',
          citations: googleResult.citations ? JSON.stringify(googleResult.citations) : null,
          links: googleResult.links ? JSON.stringify(googleResult.links) : null,
          mentionText: mentionText || undefined,
        });

        // Update last checked time
        await db
          .update(keywords)
          .set({ lastCheckedAt: new Date() })
          .where(eq(keywords.id, kw.id));

        totalResults++;
      } catch (error) {
        const msg = `App "${app.name}" keyword "${kw.keyword}": ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`[Cron] Error: ${msg}`);
        errors.push(msg);
      }

      totalChecked++;
    }
  }

  console.log(`[Cron] Done. Apps: ${allApps.length}, Keywords: ${totalChecked}, Results: ${totalResults}, Errors: ${errors.length}`);

  return Response.json({
    status: 'completed',
    apps: allApps.length,
    keywordsChecked: totalChecked,
    resultsCreated: totalResults,
    errors: errors.length > 0 ? errors : undefined,
  });
}
