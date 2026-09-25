import { parsePageRecord } from './parse';
import type { Loader } from './remote';

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
