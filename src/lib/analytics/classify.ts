const SELF = new Set(['nomo.md', 'nomo.fyi', 'localhost', '127.0.0.1']);

const SOURCES: [string, RegExp][] = [
  ['chatgpt', /(^|\.)(chatgpt\.com|chat\.openai\.com|openai\.com)$/],
  ['claude', /(^|\.)claude\.ai$/],
  ['perplexity', /(^|\.)perplexity\.ai$/],
  ['gemini', /^(gemini|bard)\.google\.com$/],
  ['copilot', /^copilot\.microsoft\.com$|(^|\.)copilot\.com$/],
  ['google', /(^|\.)google\.[a-z.]+$/],
  ['bing', /(^|\.)bing\.com$/],
  ['duckduckgo', /(^|\.)duckduckgo\.com$/],
  ['brave', /^search\.brave\.com$/],
  ['x', /^(x\.com|t\.co|twitter\.com)$/],
  ['reddit', /(^|\.)reddit\.com$/],
  ['linkedin', /(^|\.)(linkedin\.com|lnkd\.in)$/],
  ['hn', /^news\.ycombinator\.com$/],
  ['github', /(^|\.)github\.com$/],
];

export const AI_SOURCES = ['chatgpt', 'claude', 'perplexity', 'gemini', 'copilot'];

export function referrerHost(referrer: string | null | undefined) {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, '');
    return host || null;
  } catch {
    return null;
  }
}

export function isSelf(host: string | null) {
  return Boolean(host && SELF.has(host));
}

export function sourceFor(host: string | null, utmSource?: string | null) {
  const hint = utmSource?.toLowerCase().replace(/^www\./, '');
  for (const candidate of [host, hint]) {
    if (!candidate) continue;
    if (isSelf(candidate)) return 'internal';
    const match = SOURCES.find(([, pattern]) => pattern.test(candidate));
    if (match) return match[0];
  }
  return host ? 'other' : 'direct';
}

export function deviceFor(userAgent: string) {
  if (/iPad|Tablet|Android(?!.*Mobile)/i.test(userAgent)) return 'tablet';
  if (/Mobi|iPhone|Android/i.test(userAgent)) return 'mobile';
  return 'desktop';
}

function hex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer), byte => byte.toString(16).padStart(2, '0')).join('');
}

async function hmac(secret: string, message: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message)));
}

export async function visitorHash(ip: string, userAgent: string, secret: string, day: string) {
  const salt = await hmac(secret, `salt:${day}`);
  return (await hmac(salt, `${ip}|${userAgent}`)).slice(0, 20);
}

export function dayOf(date: Date) {
  return date.toISOString().slice(0, 10);
}
