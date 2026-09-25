import { cacheLife, cacheTag } from 'next/cache';
import { matchRoute } from '../content/routes';
import type { PageResult } from '../content/resolver';
import { PREVIEW_USER, previewDirectory, resolveSitePath } from './site';

export function pathFromSegments(segments?: string[]) {
  return `/${(segments ?? []).map(decodeURIComponent).join('/')}`;
}

export function profileTag(username: string) {
  return `p:${username.toLowerCase()}`;
}

function isLocalEdit(pathname: string) {
  const route = matchRoute(pathname);
  if (process.env.NODE_ENV !== 'production' && route.type === 'native') return true;
  return Boolean(previewDirectory()) && 'username' in route && route.username.toLowerCase() === PREVIEW_USER;
}

async function cachedPage(pathname: string): Promise<PageResult> {
  'use cache';
  const route = matchRoute(pathname);
  if ('username' in route) cacheTag(profileTag(route.username));
  cacheLife('profile');
  const result = await resolveSitePath(pathname);
  if (result.status === 'error') throw new Error(`Could not load ${pathname}`);
  return result;
}

export function getPage(pathname: string): Promise<PageResult> {
  return isLocalEdit(pathname) ? resolveSitePath(pathname) : cachedPage(pathname);
}
