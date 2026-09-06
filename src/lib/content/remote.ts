import { buildGitHubRawBase, buildJsDelivrBase } from './paths';
import { parsePageRecord } from './parse';
import type { PageRecord } from './types';

export type RemoteResult = { status: 'ready'; page: PageRecord } | { status: 'missing' | 'error' };
type Options = {
  fetcher?: typeof fetch;
  now?: () => number;
  ttl?: number;
  timeout?: number;
  preview?: { username: string; base: string };
};

function candidates(username: string, path: string, preview?: Options['preview']) {
  if (preview?.username.toLowerCase() === username.toLowerCase()) return [{ base: preview.base, url: `${preview.base}/${path}` }];
  return ['main', 'master'].flatMap(branch => [buildGitHubRawBase(username, branch), buildJsDelivrBase(username, branch)]
    .map(base => ({ base, url: `${base}/${path}` })));
}

async function requestPage(candidate: { base: string; url: string }, username: string, fetcher: typeof fetch, timeout: number): Promise<RemoteResult> {
  try {
    const response = await fetcher(candidate.url, { signal: AbortSignal.timeout(timeout) });
    if (response.status === 404) return { status: 'missing' };
    if (!response.ok) return { status: 'error' };
    return { status: 'ready', page: parsePageRecord(await response.text(), candidate.base, `/${username.toLowerCase()}`) };
  } catch {
    return { status: 'error' };
  }
}

export function createRemoteLoader({ fetcher = fetch, now = Date.now, ttl = 300_000, timeout = 4_000, preview }: Options = {}) {
  const cache = new Map<string, { expires: number; promise: Promise<RemoteResult> }>();
  async function request(username: string, path: string): Promise<RemoteResult> {
    let failed = false;
    for (const candidate of candidates(username, path, preview)) {
      const result = await requestPage(candidate, username, fetcher, timeout);
      if (result.status === 'ready') return result;
      failed ||= result.status === 'error';
    }
    return { status: failed ? 'error' : 'missing' };
  }
  return function load(username: string, contentPath?: string): Promise<RemoteResult> {
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
