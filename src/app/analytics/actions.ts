'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { checkPassword, createSession, createThrottle, SESSION_COOKIE, SESSION_DAYS } from '@/lib/analytics/auth';
import { clientIp, secret } from '@/lib/analytics/record';

const throttle = createThrottle();

export async function login(form: FormData) {
  const ip = clientIp(await headers());
  if (throttle.blocked(ip)) redirect('/analytics?error=wait');
  const password = process.env.ANALYTICS_PASSWORD;
  const given = String(form.get('password') ?? '');
  if (!password || !await checkPassword(given, password, secret())) {
    throttle.count(ip);
    redirect('/analytics?error=wrong');
  }
  throttle.clear(ip);
  (await cookies()).set(SESSION_COOKIE, await createSession(secret()), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/analytics',
    maxAge: SESSION_DAYS * 86_400,
  });
  redirect('/analytics');
}
