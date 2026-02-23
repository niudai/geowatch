import { auth } from '@/auth';
import { db } from '@/lib/db';
import { apps, keywords } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { canCreateApp } from '@/lib/subscription';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const userApps = await db
    .select()
    .from(apps)
    .where(eq(apps.userId, session.user.id));

  return Response.json(userApps);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // Check app creation limit
  const limitCheck = await canCreateApp(session.user.id);
  if (!limitCheck.allowed) {
    return Response.json({ error: limitCheck.reason, code: 'LIMIT_EXCEEDED' }, { status: 403 });
  }

  const body = await req.json();
  const { name, description, domain, productProfile, keywords: keywordList } = body;
  if (!name) return Response.json({ error: 'Name required' }, { status: 400 });

  const slug = name.toLowerCase().replace(/\s+/g, '-');

  const [newApp] = await db
    .insert(apps)
    .values({
      userId: session.user.id,
      name,
      slug,
      description,
      domain: domain || null,
      productProfile: productProfile || null,
      status: 'active',
    })
    .returning();

  // Bulk insert keywords if provided
  if (Array.isArray(keywordList) && keywordList.length > 0) {
    const keywordValues = keywordList
      .filter((kw: string) => typeof kw === 'string' && kw.trim())
      .map((kw: string) => ({
        appId: newApp.id,
        keyword: kw.trim(),
        status: 'active' as const,
      }));

    if (keywordValues.length > 0) {
      await db.insert(keywords).values(keywordValues);
    }
  }

  return Response.json(newApp);
}
