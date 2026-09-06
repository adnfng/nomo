import { handleHit, handleStats, type Store } from './src/lib/analytics/http';

type Env = {
  ANALYTICS?: { get(key: string): Promise<string | null>; put(key: string, value: string): Promise<void> };
  ASSETS: { fetch: typeof fetch };
};

const KEY = 'stats';

function kvStore(env: Env): Store {
  return {
    async read() {
      const raw = await env.ANALYTICS?.get(KEY);
      return raw ? JSON.parse(raw) : null;
    },
    async write(stats) {
      await env.ANALYTICS?.put(KEY, JSON.stringify(stats));
    },
  };
}

export default {
  async fetch(request: Request, env: Env) {
    const path = new URL(request.url).pathname;
    if (path === '/api/hit' && request.method === 'POST') return handleHit(request, kvStore(env));
    if (path === '/api/stats' && request.method === 'GET') return handleStats(kvStore(env));
    return new Response('Not found', { status: 404 });
  },
};
