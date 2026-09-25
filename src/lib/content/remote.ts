import { buildGitHubRawBase } from './paths';
import { parsePageRecord } from './parse';
import type { PageRecord } from './types';

export type RemoteResult = { status: 'ready'; page: PageRecord } | { status: 'missing' | 'error' };
export type Loader = (username: string, contentPath?: string) => Promise<RemoteResult>;
type Options = {
  fetcher?: typeof fetch;
  now?: () => number;
  ttl?: number;
  timeout?: number;
  retries?: number;
};

const BRANCHES = ['main', 'master'];

async function requestPage(base: string, path: string, username: string, fetcher: typeof fetch, timeout: number): Promise<RemoteResult> {
  try {
    const response = await fetcher(`${base}/${path}`, { signal: AbortSignal.timeout(timeout) });
    if (response.status === 404) return { status: 'missing' };
    if (!response.ok) return { status: 'error' };
    return { status: 'ready', page: parsePageRecord(await response.text(), base, `/${username.toLowerCase()}`) };
  } catch {
    return { status: 'error' };
  }
}

async function requestBranch(base: string, path: string, username: string, fetcher: typeof fetch, timeout: number, retries: number) {
  let result = await requestPage(base, path, username, fetcher, timeout);
  for (let attempt = 0; result.status === 'error' && attempt < retries; attempt++) result = await requestPage(base, path, username, fetcher, timeout);
  return result;
}

export function createRemoteLoader({ fetcher = fetch, now = Date.now, ttl = 60_000, timeout = 4_000, retries = 1 }: Options = {}): Loader {
  const cache = new Map<string, { expires: number; promise: Promise<RemoteResult> }>();
  async function request(username: string, path: string): Promise<RemoteResult> {
    let failed = false;
    for (const branch of BRANCHES) {
      const result = await requestBranch(buildGitHubRawBase(username, branch), path, username, fetcher, timeout, retries);
      if (result.status === 'ready') return result;
      failed ||= result.status === 'error';
    }
    return { status: failed ? 'error' : 'missing' };
  }
  return function load(username, contentPath) {
    const path = contentPath ? `content/${contentPath}.md` : 'human.md';
    const key = `${username.toLowerCase()}:${path}`;
    const existing = cache.get(key);
    if (existing && existing.expires > now()) return existing.promise;
    const promise = request(username, path);
    cache.set(key, { expires: now() + ttl, promise });
    if (cache.size > 100) cache.delete(cache.keys().next().value!);
    void promise.then(result => {
      if (result.status !== 'ready' && cache.get(key)?.promise === promise) cache.delete(key);
    });
    return promise;
  };
}
