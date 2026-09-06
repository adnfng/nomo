import { applyHit, parseHit, publicStats, readStats, type Stats } from './store';

export type Store = {
  read(): Promise<unknown>;
  write(stats: Stats): Promise<void>;
};

const JSON_HEADERS = { 'content-type': 'application/json', 'cache-control': 'no-store' };

export async function handleHit(request: Request, store: Store) {
  if (request.headers.get('dnt') === '1') return new Response(null, { status: 204 });
  const hit = parseHit(await readBody(request));
  if (!hit) return new Response(null, { status: 400 });
  await store.write(applyHit(readStats(await store.read()), hit));
  return new Response(null, { status: 204 });
}

export async function handleStats(store: Store) {
  return new Response(JSON.stringify(publicStats(readStats(await store.read()))), { headers: JSON_HEADERS });
}

async function readBody(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
