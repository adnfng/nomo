import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';
import { classifyBot } from './lib/bots';
import { matchRoute } from './lib/content/routes';
import { database } from './lib/analytics/db';
import { describeHit, recordHit } from './lib/analytics/record';
import { FILE, markdownTarget } from './lib/server/negotiate';
import { createProfileStatus } from './lib/server/profile-status';

const always = ['adnfng', ...(process.env.NODE_ENV !== 'production' && process.env.NOMO_PREVIEW_DIR ? ['preview'] : [])];
const profileStatus = createProfileStatus({ always });

const READABLE = /\.(?:md|txt|xml)$/i;

function isDocument(request: NextRequest) {
  return request.method === 'GET' && !request.headers.has('rsc') && !request.headers.has('next-router-prefetch');
}

async function isMissing(pathname: string) {
  if (FILE.test(pathname)) return false;
  const route = matchRoute(pathname);
  if (route.type === 'not-found') return true;
  if (!('username' in route)) return false;
  return (await profileStatus(route.username)) === 'missing';
}

async function logCrawler(request: NextRequest, status: number) {
  const sql = await database();
  if (!sql) return;
  const hit = await describeHit({ headers: request.headers, path: request.nextUrl.pathname, referrer: request.headers.get('referer'), status });
  await recordHit(sql, hit);
}

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;
  if (!isDocument(request)) return NextResponse.next();
  const markdown = markdownTarget(pathname, request.headers.get('accept'));
  const missing = !markdown && await isMissing(pathname);
  if (classifyBot(request.headers.get('user-agent')) && (!FILE.test(pathname) || READABLE.test(pathname))) {
    event.waitUntil(logCrawler(request, missing ? 404 : 200).catch(error => console.error('Crawler log failed:', error)));
  }
  if (markdown) return NextResponse.rewrite(new URL(markdown, request.url));
  return missing ? NextResponse.rewrite(request.nextUrl, { status: 404 }) : NextResponse.next();
}

export const config = {
  matcher: [{
    source: '/((?!api/|_next/|analytics(?:$|/)|.*\\.(?!md$|txt$|xml$)[A-Za-z0-9]+$).*)',
    missing: [{ type: 'header', key: 'rsc' }, { type: 'header', key: 'next-router-prefetch' }],
  }],
};
