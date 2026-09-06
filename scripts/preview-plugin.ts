import { readFile, realpath } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import type { Plugin } from 'vite';

const mediaTypes: Record<string, string> = { '.md': 'text/plain', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.webm': 'video/webm' };
export function localProfilePreview(directory: string): Plugin {
  return {
    name: 'local-profile-preview',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__nomo-local', async (req, res) => {
        try {
          const path = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname).slice(1);
          if (path !== 'human.md' && !/^(content|assets)\//.test(path)) throw new Error('Not a profile file');
          const root = await realpath(directory);
          const file = await realpath(resolve(root, path));
          if (!file.startsWith(root + sep)) throw new Error('Outside profile');
          res.setHeader('Content-Type', mediaTypes[extname(file)] ?? 'application/octet-stream');
          res.setHeader('Cache-Control', 'no-store');
          res.end(await readFile(file));
        } catch {
          res.statusCode = 404;
          res.end('Not found');
        }
      });
    },
  };
}
