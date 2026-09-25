import { cacheLife, cacheTag } from 'next/cache';
import { SITE } from '@/lib/content/identity';
import { matchRoute } from '@/lib/content/routes';
import { profileTag } from '@/lib/server/page-data';
import { loadProfileSource, readNativeSource } from '@/lib/server/site';

const NATIVE: Record<string, string> = { '': 'home', index: 'home', home: 'home', docs: 'docs', changelog: 'changelog', compare: 'compare', agents: 'agents' };

async function profileSource(username: string) {
  'use cache';
  cacheTag(profileTag(username));
  cacheLife('profile');
  return (await loadProfileSource(username)) ?? null;
}

async function source(path: string): Promise<{ text: string; page: string } | null> {
  const native = NATIVE[path.toLowerCase()];
  if (native !== undefined) {
    const text = readNativeSource(native);
    return text === undefined ? null : { text, page: native === 'home' ? '/' : `/${native}` };
  }
  const route = matchRoute(`/${path}`);
  if (route.type !== 'profile-root') return null;
  const text = await profileSource(route.username).catch(() => null);
  return text === null ? null : { text, page: `/${route.username.toLowerCase()}` };
}

export async function GET(_request: Request, { params }: { params: Promise<{ path?: string[] }> }) {
  const path = ((await params).path ?? []).join('/');
  const found = await source(path);
  if (!found) return new Response('Not found\n', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8', Vary: 'Accept' } });
  return new Response(found.text, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=86400',
      Link: `<${SITE}${found.page}>; rel="canonical"`,
      Vary: 'Accept',
    },
  });
}
