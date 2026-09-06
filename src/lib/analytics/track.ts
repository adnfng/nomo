import { emptyStats, isTrackedPath, type Stats } from './store';

const SESSION = 'nomo-sid';

function optedOut() {
  return navigator.doNotTrack === '1' || navigator.doNotTrack === 'yes';
}

function sessionId() {
  try {
    const existing = sessionStorage.getItem(SESSION);
    if (existing) return existing;
    const next = crypto.randomUUID();
    sessionStorage.setItem(SESSION, next);
    return next;
  } catch {
    return crypto.randomUUID();
  }
}

export function trackPage(pathname: string, profile?: string) {
  if (optedOut() || !isTrackedPath(pathname)) return;
  const body = JSON.stringify({ path: pathname, profile, session: sessionId() });
  void fetch('/api/hit', { method: 'POST', body, headers: { 'content-type': 'application/json' }, keepalive: true }).catch(() => {});
}

export async function loadStats(): Promise<Stats> {
  try {
    const response = await fetch('/api/stats');
    if (!response.ok) return emptyStats();
    return { ...emptyStats(), ...(await response.json()) as Partial<Stats> };
  } catch {
    return emptyStats();
  }
}
