import { cookies } from 'next/headers';
import { secret } from '@/lib/analytics/record';
import { seal } from '@/lib/crypto';
import { matchRoute } from '@/lib/content/routes';
import { CLAIM_COOKIE } from '@/lib/server/claim';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const user = url.searchParams.get('user') ?? '';
  const route = matchRoute(`/${user}`);
  const clientId = process.env.GITHUB_APP_CLIENT_ID;
  if (route.type !== 'profile-root' || !clientId) return Response.redirect(new URL(`/new?user=${encodeURIComponent(user)}`, url), 303);
  const nonce = crypto.randomUUID();
  const state = await seal(secret(), { user: route.username, nonce, exp: Date.now() + 10 * 60_000 });
  (await cookies()).set(CLAIM_COOKIE, nonce, { httpOnly: true, secure: url.protocol === 'https:', sameSite: 'lax', path: '/api/claim', maxAge: 600 });
  const authorize = new URL('https://github.com/login/oauth/authorize');
  authorize.searchParams.set('client_id', clientId);
  authorize.searchParams.set('redirect_uri', new URL('/api/claim/callback', url).toString());
  authorize.searchParams.set('state', state);
  authorize.searchParams.set('login', route.username);
  authorize.searchParams.set('allow_signup', 'true');
  return Response.redirect(authorize, 303);
}
