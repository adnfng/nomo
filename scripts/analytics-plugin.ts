import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import type { Plugin } from 'vite';
import { handleHit, handleStats, type Store } from '../src/lib/analytics/http';

const FILE = resolve(process.cwd(), '.data/analytics.json');

function fileStore(): Store {
  return {
    async read() {
      try {
        return JSON.parse(await readFile(FILE, 'utf8'));
      } catch {
        return null;
      }
    },
    async write(stats) {
      await mkdir(dirname(FILE), { recursive: true });
      await writeFile(FILE, JSON.stringify(stats));
    },
  };
}

export function localAnalytics(): Plugin {
  const store = fileStore();
  return {
    name: 'local-analytics',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.split('?')[0] !== '/api/hit' && req.url?.split('?')[0] !== '/api/stats') {
          next();
          return;
        }
        const request = await incoming(req);
        const response = req.url.startsWith('/api/hit') ? await handleHit(request, store) : await handleStats(store);
        res.statusCode = response.status;
        response.headers.forEach((value, key) => res.setHeader(key, value));
        res.end(Buffer.from(await response.arrayBuffer()));
      });
    },
  };
}

function incoming(req: { method?: string; url?: string; headers: NodeJS.Dict<string | string[]>; on(event: string, fn: (chunk?: Buffer) => void): void }) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === 'string') headers.set(key, value);
  }
  return readRequest(req).then(body => new Request(new URL(req.url ?? '/', 'http://localhost'), {
    method: req.method,
    headers,
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : body,
  }));
}

function readRequest(req: { on(event: string, fn: (chunk?: Buffer) => void): void }) {
  return new Promise<Buffer>(resolveBuffer => {
    const chunks: Buffer[] = [];
    req.on('data', chunk => { if (chunk) chunks.push(chunk); });
    req.on('end', () => resolveBuffer(Buffer.concat(chunks)));
  });
}
