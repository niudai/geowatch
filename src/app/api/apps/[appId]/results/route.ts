import { auth } from '@/auth';
import { db } from '@/lib/db';
import { apps, monitoringResults, keywords } from '@/lib/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(req: Request, { params }: { params: { appId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify ownership
  const app = await db.select().from(apps).where(eq(apps.id, params.appId)).limit(1);
  if (!app[0] || app[0].userId !== session.user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Get recent results (last 50)
  const results = await db
    .select()
    .from(monitoringResults)
    .where(eq(monitoringResults.appId, params.appId))
    .orderBy(desc(monitoringResults.createdAt))
    .limit(50);

  return Response.json(results);
}
