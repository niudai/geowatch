import { auth } from '@/auth';
import { db } from '@/lib/db';
import { apps, keywords, monitoringResults } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(req: Request, { params }: { params: Promise<{ appId: string }> }) {
  const { appId } = await params;
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const appKeywords = await db
    .select()
    .from(keywords)
    .where(eq(keywords.appId, appId));

  return Response.json(appKeywords);
}

export async function POST(req: Request, { params }: { params: Promise<{ appId: string }> }) {
  const { appId } = await params;
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify ownership
  const app = await db.select().from(apps).where(eq(apps.id, appId)).limit(1);
  if (!app[0] || app[0].userId !== session.user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { keyword } = await req.json();
  if (!keyword) return Response.json({ error: 'Keyword required' }, { status: 400 });

  const [newKeyword] = await db
    .insert(keywords)
    .values({
      appId,
      keyword,
      status: 'active',
    })
    .returning();

  return Response.json(newKeyword);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ appId: string }> }) {
  const { appId } = await params;
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify ownership
  const app = await db.select().from(apps).where(eq(apps.id, appId)).limit(1);
  if (!app[0] || app[0].userId !== session.user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { keywordId } = await req.json();
  if (!keywordId) return Response.json({ error: 'keywordId required' }, { status: 400 });

  // Delete associated monitoring results first
  await db.delete(monitoringResults).where(eq(monitoringResults.keywordId, keywordId));

  // Delete the keyword
  await db.delete(keywords).where(
    and(eq(keywords.id, keywordId), eq(keywords.appId, appId))
  );

  return Response.json({ success: true });
}
