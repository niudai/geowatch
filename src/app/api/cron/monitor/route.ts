import { db } from '@/lib/db';
import { apps, keywords, monitoringResults, users } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { queryGoogleAIMode, detectMention } from '@/lib/monitoring';
import { getUserSubscription, isActiveSubscription } from '@/lib/subscription';
import { sendAuditEmail } from '@/lib/email';
import type { AppReport } from '@/lib/email';

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

  // Collect per-user report data for emails
  const userReports: Record<string, {
    userId: string;
    apps: AppReport[];
    totalKeywords: number;
    totalMentions: number;
    totalResults: number;
    errors: string[];
  }> = {};

  for (const app of allApps) {
    // Skip apps whose owners don't have an active subscription
    const sub = await getUserSubscription(app.userId);
    if (!sub?.plan || !isActiveSubscription(sub.status)) {
      console.log(`[Cron] Skipping app "${app.name}" — no active subscription (${sub?.status ?? 'none'})`);
      continue;
    }

    // Initialize user report
    if (!userReports[app.userId]) {
      userReports[app.userId] = {
        userId: app.userId,
        apps: [],
        totalKeywords: 0,
        totalMentions: 0,
        totalResults: 0,
        errors: [],
      };
    }

    const appKeywords = await db
      .select()
      .from(keywords)
      .where(and(eq(keywords.appId, app.id), eq(keywords.status, 'active')));

    const brandName = app.name;
    const appReport: AppReport = {
      appName: app.name,
      keywordsChecked: 0,
      mentions: 0,
      totalResults: 0,
      results: [],
    };

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

        // Track for email report
        appReport.results.push({
          keyword: kw.keyword,
          source: 'google_ai_mode',
          mentioned,
        });
        appReport.totalResults++;
        if (mentioned) appReport.mentions++;

        totalResults++;
      } catch (error) {
        const msg = `App "${app.name}" keyword "${kw.keyword}": ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`[Cron] Error: ${msg}`);
        errors.push(msg);
        userReports[app.userId].errors.push(msg);
      }

      totalChecked++;
      appReport.keywordsChecked++;
    }

    userReports[app.userId].apps.push(appReport);
    userReports[app.userId].totalKeywords += appReport.keywordsChecked;
    userReports[app.userId].totalMentions += appReport.mentions;
    userReports[app.userId].totalResults += appReport.totalResults;
  }

  // Send audit emails to each user
  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let emailsSent = 0;
  for (const report of Object.values(userReports)) {
    // Skip if no results were generated
    if (report.totalResults === 0 && report.errors.length === 0) continue;

    try {
      const [user] = await db
        .select({ name: users.name, email: users.email })
        .from(users)
        .where(eq(users.id, report.userId))
        .limit(1);

      if (!user?.email) continue;

      await sendAuditEmail({
        userName: user.name || 'there',
        userEmail: user.email,
        date: dateStr,
        apps: report.apps,
        totalKeywords: report.totalKeywords,
        totalMentions: report.totalMentions,
        totalResults: report.totalResults,
        errors: report.errors,
      });
      emailsSent++;
    } catch (error) {
      console.error(`[Cron] Failed to send email for user ${report.userId}:`, error);
    }
  }

  console.log(`[Cron] Done. Apps: ${allApps.length}, Keywords: ${totalChecked}, Results: ${totalResults}, Errors: ${errors.length}, Emails: ${emailsSent}`);

  return Response.json({
    status: 'completed',
    apps: allApps.length,
    keywordsChecked: totalChecked,
    resultsCreated: totalResults,
    emailsSent,
    errors: errors.length > 0 ? errors : undefined,
  });
}
