import { auth } from '@/auth';
import { db } from '@/lib/db';
import { apps } from '@/lib/schema';
import { eq } from 'drizzle-orm';

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

  const { name, description } = await req.json();
  if (!name) return Response.json({ error: 'Name required' }, { status: 400 });

  const slug = name.toLowerCase().replace(/\s+/g, '-');

  const [newApp] = await db
    .insert(apps)
    .values({
      userId: session.user.id,
      name,
      slug,
      description,
      status: 'active',
    })
    .returning();

  return Response.json(newApp);
}
