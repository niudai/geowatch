import { auth } from '@/auth';
import { db } from '@/lib/db';
import { apps, keywords } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(req: Request, { params }: { params: { appId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const appKeywords = await db
    .select()
    .from(keywords)
    .where(eq(keywords.appId, params.appId));

  return Response.json(appKeywords);
}

export async function POST(req: Request, { params }: { params: { appId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify ownership
  const app = await db.select().from(apps).where(eq(apps.id, params.appId)).limit(1);
  if (!app[0] || app[0].userId !== session.user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { keyword } = await req.json();
  if (!keyword) return Response.json({ error: 'Keyword required' }, { status: 400 });

  const [newKeyword] = await db
    .insert(keywords)
    .values({
      appId: params.appId,
      keyword,
      status: 'active',
    })
    .returning();

  return Response.json(newKeyword);
}
