import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { secret } from '@/lib/analytics/record';
import { unseal } from '@/lib/crypto';
import { CLAIM_COOKIE, claimPage } from '@/lib/server/claim';
import { lookupGitHub } from '@/lib/server/github';
import { profileTag } from '@/lib/server/page-data';

type State = { user: string; nonce: string; exp: number };

async function exchange(code: string, redirectUri: string) {
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: process.env.GITHUB_APP_CLIENT_ID, client_secret: process.env.GITHUB_APP_CLIENT_SECRET, code, redirect_uri: redirectUri }),
    signal: AbortSignal.timeout(10_000),
  });
  const body = await response.json().catch(() => ({})) as { access_token?: string };
  return body.access_token;
}

async function revoke(token: string) {
  const id = process.env.GITHUB_APP_CLIENT_ID;
  const key = process.env.GITHUB_APP_CLIENT_SECRET;
  if (!id || !key) return;
  await fetch(`https://api.github.com/applications/${id}/token`, {
    method: 'DELETE',
    headers: { Accept: 'application/vnd.github+json', Authorization: `Basic ${Buffer.from(`${id}:${key}`).toString('base64')}` },
    body: JSON.stringify({ access_token: token }),
  }).catch(() => {});
}

function back(url: URL, path: string) {
  return Response.redirect(new URL(path, url), 303);
}

async function verifiedState(url: URL) {
  const jar = await cookies();
  const state = await unseal<State>(secret(), url.searchParams.get('state'));
  const nonce = jar.get(CLAIM_COOKIE)?.value;
  jar.delete({ name: CLAIM_COOKIE, path: '/api/claim' });
  return state && state.exp >= Date.now() && nonce && state.nonce === nonce ? state : null;
}

async function claim(user: string, token: string) {
  const lookup = await lookupGitHub(user);
  const result = await claimPage(user, lookup.status === 'found' ? lookup.profile : null, { token });
  const retry = `/new?user=${encodeURIComponent(user)}`;
  if (result.status === 'mismatch') return `${retry}&error=mismatch&as=${encodeURIComponent(result.login)}`;
  if (result.status === 'failed') return `${retry}&error=github`;
  revalidateTag(profileTag(result.login), { expire: 0 });
  return `/new/done?user=${encodeURIComponent(result.login)}${result.status === 'existing' ? '&existing=1' : ''}`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const state = await verifiedState(url);
  if (!state) return back(url, '/new?error=expired');
  const retry = `/new?user=${encodeURIComponent(state.user)}`;
  const code = url.searchParams.get('code');
  if (!code) return back(url, `${retry}&error=cancelled`);
  const token = await exchange(code, new URL('/api/claim/callback', url).toString());
  if (!token) return back(url, `${retry}&error=github`);
  try {
    return back(url, await claim(state.user, token));
  } finally {
    await revoke(token);
  }
}
