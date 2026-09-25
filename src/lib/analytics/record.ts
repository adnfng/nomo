import { matchRoute } from '../content/routes';
import { classifyBot } from '../bots';
import { dayOf, deviceFor, referrerHost, sourceFor, visitorHash } from './classify';
import type { Sql } from './db';

export type Hit = {
  path: string;
  profile: string | null;
  referrerHost: string | null;
  source: string;
  country: string | null;
  device: string;
  visitor: string | null;
  status: number;
  bot: string | null;
  ts?: Date;
};

export function profileFromPath(pathname: string) {
  const route = matchRoute(pathname);
  if (!('username' in route)) return null;
  const name = route.username.toLowerCase();
  return name === 'preview' ? null : name;
}

export function secret() {
  return process.env.NOMO_SECRET || 'nomo-local-secret';
}

export function clientIp(headers: Headers) {
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim() || headers.get('x-real-ip') || '0.0.0.0';
}

type Context = { headers: Headers; path: string; referrer?: string | null; utm?: string | null; status?: number; now?: Date };

export async function describeHit({ headers, path, referrer, utm, status = 200, now = new Date() }: Context): Promise<Hit> {
  const userAgent = headers.get('user-agent') ?? '';
  const host = referrerHost(referrer);
  const bot = classifyBot(userAgent);
  return {
    path: path.slice(0, 300),
    profile: status === 404 ? null : profileFromPath(path),
    referrerHost: host,
    source: sourceFor(host, utm),
    country: headers.get('x-vercel-ip-country'),
    device: deviceFor(userAgent),
    visitor: bot ? null : await visitorHash(clientIp(headers), userAgent, secret(), dayOf(now)),
    status,
    bot: bot?.name ?? null,
    ts: now,
  };
}

export async function recordHit(sql: Sql, hit: Hit) {
  await sql(
    'insert into hits (ts, path, profile, referrer_host, source, country, device, visitor, status, is_bot, bot) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
    [(hit.ts ?? new Date()).toISOString(), hit.path, hit.profile, hit.referrerHost, hit.source, hit.country, hit.device, hit.visitor, hit.status, hit.bot !== null, hit.bot],
  );
}

export async function rollup(sql: Sql, keepDays = 90) {
  const cutoff = `now() - interval '${Math.max(1, Math.floor(keepDays))} days'`;
  await sql(`insert into daily (day, profile, source, bot, views, visitors)
    select ts::date, coalesce(profile, ''), case when is_bot then '' else source end, coalesce(bot, ''), count(*)::int, count(distinct visitor)::int
    from hits where ts < ${cutoff} group by 1, 2, 3, 4
    on conflict (day, profile, source, bot) do update set views = daily.views + excluded.views, visitors = daily.visitors + excluded.visitors`);
  const removed = await sql(`delete from hits where ts < ${cutoff} returning id`);
  return removed.length;
}
