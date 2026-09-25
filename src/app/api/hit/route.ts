import { isbot } from 'isbot';
import { after } from 'next/server';
import { createThrottle } from '@/lib/analytics/auth';
import { database } from '@/lib/analytics/db';
import { clientIp, describeHit, recordHit } from '@/lib/analytics/record';
import { createProfileStatus } from '@/lib/server/profile-status';

const profileStatus = createProfileStatus({ always: ['adnfng'] });
const flood = createThrottle({ limit: 120, window: 60_000 });

type Beacon = { path?: unknown; referrer?: unknown; utm?: unknown };

function text(value: unknown, max: number) {
  return typeof value === 'string' ? value.slice(0, max) : null;
}

async function statusFor(profile: string | null) {
  if (!profile) return 200;
  return (await profileStatus(profile)) === 'missing' ? 404 : 200;
}

export async function POST(request: Request) {
  const userAgent = request.headers.get('user-agent') ?? '';
  const ip = clientIp(request.headers);
  if (!userAgent || isbot(userAgent) || flood.blocked(ip)) return new Response(null, { status: 204 });
  flood.count(ip);
  let body: Beacon;
  try {
    body = JSON.parse(await request.text());
  } catch {
    return new Response(null, { status: 400 });
  }
  const path = text(body.path, 300);
  if (!path?.startsWith('/') || path.startsWith('/analytics') || path.startsWith('/api/')) return new Response(null, { status: 204 });
  after(async () => {
    const sql = await database();
    if (!sql) return;
    const hit = await describeHit({ headers: request.headers, path, referrer: text(body.referrer, 500), utm: text(body.utm, 100) });
    const status = await statusFor(hit.profile);
    await recordHit(sql, { ...hit, status, profile: status === 404 ? null : hit.profile });
  });
  return new Response(null, { status: 204 });
}
