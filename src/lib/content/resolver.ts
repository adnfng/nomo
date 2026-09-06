import { inheritPortfolio, presentPage, selectSection } from './presentation';
import { matchRoute, type NativeSlug } from './routes';
import type { RemoteResult } from './remote';
import type { PageRecord } from './types';

export type PageResult = { page: PageRecord | null; slug: string; isHome: boolean; status: 'ready' | 'missing' | 'error' };
type Loader = (username: string, contentPath?: string) => Promise<RemoteResult>;

export function createPageResolver(native: Map<NativeSlug, PageRecord>, load: Loader) {
  const fallback = (status: 'missing' | 'error'): PageResult => ({ page: native.get('404') ?? null, slug: '404', isHome: false, status });
  return async function resolve(pathname: string): Promise<PageResult> {
    const route = matchRoute(pathname);
    if (route.type === 'not-found') return fallback('missing');
    if (route.type === 'native') {
      const page = native.get(route.slug);
      if (!page) return fallback('missing');
      return { page: presentPage(page), slug: route.slug, isHome: route.slug === 'home', status: 'ready' };
    }
    const result = await resolveProfile(route, load);
    if (result.status !== 'ready') return fallback(result.status);
    return { page: result.page, slug: route.slug, isHome: false, status: 'ready' };
  };
}

async function resolveProfile(route: Extract<ReturnType<typeof matchRoute>, { username: string }>, load: Loader): Promise<RemoteResult> {
  const root = await load(route.username);
  if (route.type === 'profile-root') {
    return root.status === 'ready' ? { ...root, page: presentPage(selectSection(root.page) ?? root.page) } : root;
  }
  const fromSection = root.status === 'ready' ? selectSection(root.page, route.contentPath) : undefined;
  if (fromSection) return { status: 'ready', page: presentPage(fromSection) };
  const result = await load(route.username, route.contentPath);
  if (result.status !== 'ready') return result;
  const rootPage = root.status === 'ready' ? root.page : undefined;
  return { ...result, page: inheritPortfolio(result.page, rootPage, `/${route.username.toLowerCase()}/${route.contentPath}`) };
}
