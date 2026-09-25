import { readFile, realpath } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { previewDirectory } from '@/lib/server/site';

const TYPES: Record<string, string> = { '.md': 'text/plain; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.webm': 'video/webm' };

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const directory = previewDirectory();
  const path = (await params).path.join('/');
  if (!directory || (path !== 'human.md' && !/^(content|assets)\//.test(path))) return new Response('Not found', { status: 404 });
  try {
    const root = await realpath(directory);
    const file = await realpath(resolve(root, path));
    if (!file.startsWith(root + sep)) throw new Error('Outside the profile folder');
    return new Response(new Uint8Array(await readFile(file)), { headers: { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' } });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
