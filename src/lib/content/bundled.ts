import { parsePageRecord } from './parse';
import type { RemoteResult } from './remote';

type Loader = (username: string, contentPath?: string) => Promise<RemoteResult>;

export function createBundledLoader(files: Record<string, string>, username: string, base: string, fallback: Loader): Loader {
  const root = username.toLowerCase();
  return (name, contentPath) => {
    if (name.toLowerCase() !== root) return fallback(name, contentPath);
    const path = contentPath ? `content/${contentPath}.md` : 'human.md';
    const raw = files[path];
    if (!raw) return Promise.resolve({ status: 'missing' });
    return Promise.resolve({ status: 'ready', page: parsePageRecord(raw, base, `/${root}`) });
  };
}

export function bundledFiles(modules: Record<string, string>, folder: string) {
  const prefix = `/${folder}/`;
  return Object.fromEntries(Object.entries(modules).map(([key, raw]) => [key.slice(key.lastIndexOf(prefix) + prefix.length), raw]));
}
