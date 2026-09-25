import { cacheLife, cacheTag } from 'next/cache';
import type { GitHubProfile } from '../content/preview';

export type Lookup = { status: 'found'; profile: GitHubProfile; hasRepo: boolean } | { status: 'none' } | { status: 'unknown' };

type Json = Record<string, unknown>;

function headers(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  return { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'nomo.md', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

async function api(path: string, init?: RequestInit) {
  return fetch(`https://api.github.com${path}`, { ...init, headers: { ...headers(), ...init?.headers }, signal: AbortSignal.timeout(4_000) });
}

async function json<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await api(path);
    return response.ok ? await response.json() as T : fallback;
  } catch {
    return fallback;
  }
}

const PINNED = 'query($login:String!){user(login:$login){pinnedItems(first:4,types:REPOSITORY){nodes{... on Repository{name description url stargazerCount}}}}}';

async function pinned(login: string): Promise<GitHubProfile['repos'] | null> {
  if (!process.env.GITHUB_TOKEN) return null;
  try {
    const response = await api('/graphql', { method: 'POST', body: JSON.stringify({ query: PINNED, variables: { login } }) });
    const body = await response.json() as { data?: { user?: { pinnedItems?: { nodes?: GitHubProfile['repos'] } } } };
    const nodes = body.data?.user?.pinnedItems?.nodes as Array<GitHubProfile['repos'][number] & { stargazerCount?: number }> | undefined;
    return nodes?.length ? nodes.map(({ stargazerCount, ...repo }) => ({ ...repo, stars: stargazerCount })) : null;
  } catch {
    return null;
  }
}

async function popular(login: string): Promise<GitHubProfile['repos']> {
  const repos = await json<Json[]>(`/users/${login}/repos?sort=pushed&per_page=100&type=owner`, []);
  return repos
    .filter(repo => !repo.fork && !repo.archived && repo.name !== '.nomo' && String(repo.name).toLowerCase() !== login.toLowerCase())
    .sort((a, b) => Number(b.stargazers_count) - Number(a.stargazers_count))
    .slice(0, 4)
    .map(repo => ({ name: String(repo.name), description: (repo.description as string | null) ?? null, url: String(repo.html_url), stars: Number(repo.stargazers_count) || 0 }));
}

async function hasNomoRepo(login: string) {
  try {
    return (await api(`/repos/${login}/.nomo`)).ok;
  } catch {
    return false;
  }
}

async function cachedLookup(username: string): Promise<Lookup> {
  'use cache';
  cacheTag(`p:${username.toLowerCase()}`);
  cacheLife('hours');
  const response = await api(`/users/${encodeURIComponent(username)}`);
  if (response.status === 404) return { status: 'none' };
  if (!response.ok) throw new Error(`GitHub answered ${response.status}`);
  const user = await response.json() as Json;
  const login = String(user.login);
  const [socials, repos, hasRepo] = await Promise.all([
    json<{ provider: string; url: string }[]>(`/users/${login}/social_accounts`, []),
    pinned(login).then(list => list ?? popular(login)),
    hasNomoRepo(login),
  ]);
  return {
    status: 'found',
    hasRepo,
    profile: {
      login,
      name: (user.name as string | null) ?? null,
      bio: (user.bio as string | null) ?? null,
      avatarUrl: String(user.avatar_url),
      blog: (user.blog as string | null) ?? null,
      company: (user.company as string | null) ?? null,
      location: (user.location as string | null) ?? null,
      twitter: (user.twitter_username as string | null) ?? null,
      socials,
      repos,
    },
  };
}

export async function lookupGitHub(username: string): Promise<Lookup> {
  try {
    return await cachedLookup(username);
  } catch {
    return { status: 'unknown' };
  }
}

async function cachedUpdated(username: string): Promise<string | null> {
  'use cache';
  cacheTag(`p:${username.toLowerCase()}`);
  cacheLife('hours');
  const response = await api(`/repos/${encodeURIComponent(username)}/.nomo/commits?per_page=1`);
  if (response.status === 404 || response.status === 409) return null;
  if (!response.ok) throw new Error(`GitHub answered ${response.status}`);
  const [commit] = await response.json() as Array<{ commit?: { committer?: { date?: string } } }>;
  return commit?.commit?.committer?.date ?? null;
}

export async function lastUpdated(username: string) {
  try {
    return await cachedUpdated(username) ?? undefined;
  } catch {
    return undefined;
  }
}
