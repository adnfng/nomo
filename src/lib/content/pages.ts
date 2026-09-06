import { parsePageRecord } from './parse';
import { createRemoteLoader } from './remote';
import { createPageResolver } from './resolver';
import type { NativeSlug } from './routes';
import type { PageRecord } from './types';

const modules = import.meta.glob('/pages/*.md', { eager: true, import: 'default', query: '?raw' }) as Record<string, string>;
const nativePages = new Map<NativeSlug, PageRecord>();
for (const slug of ['home', 'docs', 'changelog', '404'] as const) {
  const raw = modules[`/pages/${slug}.md`];
  if (raw) nativePages.set(slug, parsePageRecord(raw));
}

const preview = import.meta.env.DEV ? __NOMO_PREVIEW__ : undefined;
export const loadPageContent = createPageResolver(nativePages, createRemoteLoader({ preview }));
