export type ProfileStatus = 'live' | 'preview' | 'missing' | 'unknown';

type Options = {
  fetcher?: typeof fetch;
  now?: () => number;
  ttl?: number;
  always?: string[];
  token?: string;
};

async function account(username: string, fetcher: typeof fetch, token?: string): Promise<ProfileStatus> {
  try {
    const response = await fetcher(`https://api.github.com/users/${encodeURIComponent(username)}`, {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'nomo.md', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      signal: AbortSignal.timeout(3_000),
    });
    if (response.status === 404) return 'missing';
    return response.ok ? 'preview' : 'unknown';
  } catch {
    return 'unknown';
  }
}

async function probe(username: string, fetcher: typeof fetch, token?: string): Promise<ProfileStatus> {
  let failed = false;
  for (const branch of ['main', 'master']) {
    try {
      const response = await fetcher(`https://raw.githubusercontent.com/${username}/.nomo/${branch}/human.md`, { method: 'HEAD', signal: AbortSignal.timeout(3_000) });
      if (response.ok) return 'live';
      if (response.status !== 404) failed = true;
    } catch {
      failed = true;
    }
  }
  return failed ? 'unknown' : account(username, fetcher, token);
}

export function createProfileStatus({ fetcher = fetch, now = Date.now, ttl = 60_000, always = [], token = process.env.GITHUB_TOKEN }: Options = {}) {
  const known = new Set(always.map(name => name.toLowerCase()));
  const cache = new Map<string, { expires: number; status: Promise<ProfileStatus> }>();
  return function status(username: string): Promise<ProfileStatus> {
    const key = username.toLowerCase();
    if (known.has(key)) return Promise.resolve('live');
    const hit = cache.get(key);
    if (hit && hit.expires > now()) return hit.status;
    const next = probe(username, fetcher, token);
    cache.set(key, { expires: now() + ttl, status: next });
    if (cache.size > 500) cache.delete(cache.keys().next().value!);
    void next.then(value => { if (value === 'unknown') cache.delete(key); });
    return next;
  };
}
