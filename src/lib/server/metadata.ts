import type { Metadata } from 'next';
import type { PageResult } from '../content/resolver';
import { matchRoute } from '../content/routes';
import { canonicalPath, SITE } from '../content/identity';
import { profileName, summarize } from '../content/summary';

const NATIVE_TITLES: Record<string, string> = { docs: 'Docs', changelog: 'Changelog' };
export const SITE_DESCRIPTION = 'A free, open-source personal page that lives in your GitHub. Add a human.md to a public .nomo repo and it becomes nomo.md/your-username.';

function tabLabel(result: PageResult) {
  return result.page?.sections?.find(section => section.slug === result.slug)?.label;
}

function leadLine(content = '') {
  return content.match(/^\*\*(.+?)\.?\*\*\s*$/m)?.[1];
}

function nativeTitle(slug: string, result: PageResult) {
  if (slug === 'home') return 'Nomo';
  if (slug === 'compare') {
    const lead = leadLine(result.page?.content) ?? 'Nomo compared to other personal sites';
    return lead.includes('Nomo') ? lead : `${lead}: Nomo`;
  }
  return `${tabLabel(result) ?? NATIVE_TITLES[slug] ?? 'Nomo'} · Nomo`;
}

export function pageTitle(pathname: string, result: PageResult) {
  const route = matchRoute(pathname);
  if (route.type === 'native') return nativeTitle(route.slug, result);
  if (!('username' in route) || result.status !== 'ready' || !result.page) return 'Not found · Nomo';
  const name = profileName(result.page, route.username);
  const tab = route.type === 'profile-content' ? tabLabel(result) ?? route.slug : undefined;
  return tab && tab !== name ? `${tab} · ${name}` : name;
}

export function markdownPath(pathname: string) {
  return pathname === '/' ? '/index.md' : `${pathname.replace(/\/+$/, '')}.md`;
}

function hasMarkdown(route: ReturnType<typeof matchRoute>) {
  return route.type === 'profile-root' || (route.type === 'native' && !route.section);
}

function describe(route: ReturnType<typeof matchRoute>, content: string) {
  const home = route.type === 'native' && route.slug === 'home';
  return (home ? '' : summarize(content)) || SITE_DESCRIPTION;
}

export function pageMetadata(pathname: string, result: PageResult): Metadata {
  const title = pageTitle(pathname, result);
  if (result.status !== 'ready' || !result.page) return { title, robots: { index: false } };
  const route = matchRoute(pathname);
  const username = 'username' in route ? route.username : undefined;
  const path = canonicalPath(pathname, username);
  const url = `${SITE}${path}`;
  const description = describe(route, result.page.content);
  const image = username ? `/api/og/${username.toLowerCase()}` : '/og.png';
  const markdown = hasMarkdown(route) ? { types: { 'text/markdown': markdownPath(path) } } : {};
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url, ...markdown },
    openGraph: { type: username ? 'profile' : 'website', siteName: 'Nomo', url, title, description, images: [{ url: image, width: 1200, height: 630, alt: title }], ...(username ? { username } : {}) },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}
