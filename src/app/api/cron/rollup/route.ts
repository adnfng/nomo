import { database } from '@/lib/analytics/db';
import { rollup } from '@/lib/analytics/record';

export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected || request.headers.get('authorization') !== `Bearer ${expected}`) return new Response('Unauthorized', { status: 401 });
  const sql = await database();
  if (!sql) return Response.json({ ok: false, reason: 'no database' }, { status: 503 });
  return Response.json({ ok: true, removed: await rollup(sql) });
}
