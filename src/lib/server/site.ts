import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { createBundledLoader } from '../content/bundled';
import { parsePageRecord } from '../content/parse';
import { rebaseTabs, withHomeTab, withSiteTabs } from '../content/presentation';
import { createRemoteLoader, type Loader } from '../content/remote';
import { createPageResolver } from '../content/resolver';
import type { NativeSlug } from '../content/routes';
import type { PageRecord } from '../content/types';

const ROOT = process.cwd();
const NATIVE: NativeSlug[] = ['home', 'docs', 'changelog', '404'];
const remote = createRemoteLoader();

export const BUNDLED_USER = 'adnfng';
export const PREVIEW_USER = 'preview';

export function previewDirectory() {
  return process.env.NODE_ENV !== 'production' ? process.env.NOMO_PREVIEW_DIR || undefined : undefined;
}

export function readNativeSource(slug: string) {
  const file = join(ROOT, 'site', `${slug}.md`);
  return existsSync(file) ? readFileSync(file, 'utf8') : undefined;
}

function prepareNative(slug: NativeSlug, page: PageRecord) {
  if (slug === 'home') return withSiteTabs(page);
  if (page.portfolio.pages.length && slug !== '404') return withHomeTab(rebaseTabs(page, `/${slug}`));
  return page;
}

export function nativePages() {
  const pages = new Map<NativeSlug, PageRecord>();
  for (const slug of NATIVE) {
    const raw = readNativeSource(slug);
    if (raw) pages.set(slug, prepareNative(slug, parsePageRecord(raw)));
  }
  return pages;
}

function markdownFiles(directory: string, current = directory): string[] {
  if (!existsSync(current)) return [];
  return readdirSync(current).flatMap(name => {
    const path = join(current, name);
    if (statSync(path).isDirectory()) return name === 'content' || current !== directory ? markdownFiles(directory, path) : [];
    return name.endsWith('.md') ? [relative(directory, path).split(sep).join('/')] : [];
  });
}

export function readProfileFolder(directory: string) {
  return Object.fromEntries(markdownFiles(directory).map(path => [path, readFileSync(join(directory, path), 'utf8')]));
}

function siteLoader(): Loader {
  const bundled = createBundledLoader(readProfileFolder(join(ROOT, BUNDLED_USER)), BUNDLED_USER, `/${BUNDLED_USER}`, remote);
  const preview = previewDirectory();
  return preview ? createBundledLoader(readProfileFolder(preview), PREVIEW_USER, '/api/preview', bundled) : bundled;
}

export function resolveSitePath(pathname: string) {
  return createPageResolver(nativePages(), siteLoader())(pathname);
}

export function loadProfileSource(username: string): Promise<string | undefined> {
  const name = username.toLowerCase();
  if (name === BUNDLED_USER) return Promise.resolve(readProfileFolder(join(ROOT, BUNDLED_USER))['human.md']);
  const preview = previewDirectory();
  if (preview && name === PREVIEW_USER) return Promise.resolve(readProfileFolder(preview)['human.md']);
  return fetchRawProfile(username);
}

async function fetchRawProfile(username: string) {
  for (const branch of ['main', 'master']) {
    try {
      const response = await fetch(`https://raw.githubusercontent.com/${username}/.nomo/${branch}/human.md`, { signal: AbortSignal.timeout(4_000) });
      if (response.ok) return response.text();
    } catch {
      return undefined;
    }
  }
  return undefined;
}
