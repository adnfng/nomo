import { NextResponse, type NextRequest } from 'next/server';
import { matchRoute } from './lib/content/routes';
import { createProfileStatus } from './lib/server/profile-status';

const always = ['adnfng', ...(process.env.NODE_ENV !== 'production' && process.env.NOMO_PREVIEW_DIR ? ['preview'] : [])];
const profileStatus = createProfileStatus({ always });

function isDocument(request: NextRequest) {
  return request.method === 'GET' && !request.headers.has('rsc') && !request.headers.has('next-router-prefetch');
}

const FILE = /\.(?:svg|png|jpe?g|webp|gif|ico|glb|mp4|webm|woff2?|md|txt|xml|json)$/i;

async function isMissing(pathname: string) {
  if (FILE.test(pathname)) return false;
  const route = matchRoute(pathname);
  if (route.type === 'not-found') return true;
  if (!('username' in route)) return false;
  return (await profileStatus(route.username)) === 'missing';
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isDocument(request) && await isMissing(pathname)) return NextResponse.rewrite(request.nextUrl, { status: 404 });
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/|_next/|analytics).*)'],
};
