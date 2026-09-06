export type Hit = {
  path: string;
  profile?: string;
  session?: string;
};

export type ProfileStat = {
  name: string;
  views: number;
  first: string;
  last: string;
};

export type Stats = {
  views: number;
  visits: number;
  profiles: ProfileStat[];
  sessions: string[];
};

const USERNAME = /^(?!-)(?!.*--)[a-z\d-]{1,39}(?<!-)$/i;
const SESSION = /^[a-z0-9-]{8,80}$/i;

export function emptyStats(): Stats {
  return { views: 0, visits: 0, profiles: [], sessions: [] };
}

export function isTrackedPath(path: string) {
  return path.startsWith('/') && path !== '/analytics' && !path.startsWith('/analytics/');
}

export function parseHit(value: unknown): Hit | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  if (typeof record.path !== 'string' || record.path.length > 180 || !isTrackedPath(record.path)) return null;
  const hit: Hit = { path: record.path };
  if (typeof record.profile === 'string' && USERNAME.test(record.profile)) {
    hit.profile = record.profile.toLowerCase();
  }
  if (typeof record.session === 'string' && SESSION.test(record.session)) {
    hit.session = record.session;
  }
  return hit;
}

export function applyHit(stats: Stats, hit: Hit, at = new Date().toISOString()): Stats {
  const sessions = hit.session && !stats.sessions.includes(hit.session)
    ? [...stats.sessions, hit.session].slice(-2000)
    : stats.sessions;
  return {
    views: stats.views + 1,
    visits: stats.visits + (sessions === stats.sessions ? 0 : 1),
    profiles: hit.profile ? touchProfile(stats.profiles, hit.profile.toLowerCase(), at) : stats.profiles,
    sessions,
  };
}

function touchProfile(list: ProfileStat[], name: string, at: string): ProfileStat[] {
  const next = list.map(item => (item.name === name ? { ...item, views: item.views + 1, last: at } : item));
  if (!next.some(item => item.name === name)) next.push({ name, views: 1, first: at, last: at });
  return next.sort((a, b) => b.last.localeCompare(a.last) || a.name.localeCompare(b.name));
}

export function readStats(value: unknown): Stats {
  if (!value || typeof value !== 'object') return emptyStats();
  const record = value as Record<string, unknown>;
  const views = Number(record.views);
  const visits = Number(record.visits);
  return {
    views: Number.isFinite(views) && views > 0 ? views : 0,
    visits: Number.isFinite(visits) && visits > 0 ? visits : 0,
    profiles: Array.isArray(record.profiles) ? record.profiles.flatMap(readProfile) : [],
    sessions: Array.isArray(record.sessions) ? record.sessions.filter(item => typeof item === 'string' && SESSION.test(item)) : [],
  };
}

function readProfile(value: unknown): ProfileStat[] {
  if (!value || typeof value !== 'object') return [];
  const record = value as Record<string, unknown>;
  if (typeof record.name !== 'string' || !USERNAME.test(record.name)) return [];
  const views = Number(record.views);
  return [{
    name: record.name.toLowerCase(),
    views: Number.isFinite(views) && views > 0 ? views : 1,
    first: typeof record.first === 'string' ? record.first : '',
    last: typeof record.last === 'string' ? record.last : '',
  }];
}

export function publicStats(stats: Stats) {
  return { views: stats.views, visits: stats.visits, profiles: stats.profiles };
}

export function fillStats(source: string, stats: Pick<Stats, 'views' | 'visits' | 'profiles'>) {
  const seen = stats.profiles.map(item => `- [${item.name}](/${item.name}) {{${item.views}}}`).join('\n');
  return source
    .replaceAll('%visits%', String(stats.visits))
    .replaceAll('%views%', String(stats.views))
    .replaceAll('%profiles%', String(stats.profiles.length))
    .replaceAll('%seen%', seen);
}
