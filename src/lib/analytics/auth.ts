import { sameText, sign } from '../crypto';

export const SESSION_COOKIE = 'nomo_analytics';
export const SESSION_DAYS = 30;

export async function createSession(secret: string, now = Date.now()) {
  const expires = now + SESSION_DAYS * 86_400_000;
  return `${expires}.${await sign(secret, `analytics:${expires}`)}`;
}

export async function verifySession(token: string | undefined, secret: string, now = Date.now()) {
  const [expires, signature] = token?.split('.') ?? [];
  if (!expires || !signature || !(Number(expires) > now)) return false;
  return sameText(signature, await sign(secret, `analytics:${expires}`));
}

export async function checkPassword(given: string, expected: string, secret: string) {
  return sameText(await sign(secret, given), await sign(secret, expected));
}

export function createThrottle({ limit = 5, window = 10 * 60_000, now = Date.now } = {}) {
  const attempts = new Map<string, { count: number; reset: number }>();
  return {
    blocked(key: string) {
      const entry = attempts.get(key);
      return Boolean(entry && entry.reset > now() && entry.count >= limit);
    },
    count(key: string) {
      const entry = attempts.get(key);
      if (!entry || entry.reset <= now()) attempts.set(key, { count: 1, reset: now() + window });
      else entry.count++;
      if (attempts.size > 1_000) attempts.delete(attempts.keys().next().value!);
    },
    clear(key: string) {
      attempts.delete(key);
    },
  };
}
