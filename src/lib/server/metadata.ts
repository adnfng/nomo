import type { Metadata } from 'next';
import type { PageResult } from '../content/resolver';
import { matchRoute } from '../content/routes';
import { profileName, summarize } from '../content/summary';

const NATIVE_TITLES: Record<string, string> = { docs: 'Docs', changelog: 'Changelog' };

function tabLabel(result: PageResult) {
  return result.page?.sections?.find(section => section.slug === result.slug)?.label;
}

function nativeTitle(slug: string, result: PageResult) {
  if (slug === 'home') return 'Nomo';
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

export function pageMetadata(pathname: string, result: PageResult): Metadata {
  const title = pageTitle(pathname, result);
  if (result.status !== 'ready' || !result.page) return { title, robots: { index: false } };
  const description = summarize(result.page.content) || undefined;
  return { title: { absolute: title }, description };
}
