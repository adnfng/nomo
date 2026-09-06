import { bundledFiles, createBundledLoader } from './bundled';
import { parsePageRecord } from './parse';
import { rebaseTabs, withHomeTab, withSiteTabs } from './presentation';
import { createRemoteLoader } from './remote';
import { createPageResolver } from './resolver';
import type { NativeSlug } from './routes';
import type { PageRecord } from './types';

const modules = import.meta.glob('/pages/*.md', { eager: true, import: 'default', query: '?raw' }) as Record<string, string>;
const nativePages = new Map<NativeSlug, PageRecord>();
for (const slug of ['home', 'docs', 'changelog', 'analytics', '404'] as const) {
  const raw = modules[`/pages/${slug}.md`];
  if (raw) nativePages.set(slug, prepareNative(slug, parsePageRecord(raw)));
}

const site = bundledFiles(import.meta.glob('/adnfng/**/*.md', { eager: true, import: 'default', query: '?raw' }) as Record<string, string>, 'adnfng');
const preview = import.meta.env.DEV ? __NOMO_PREVIEW__ : undefined;
export const loadPageContent = createPageResolver(nativePages, createBundledLoader(site, 'adnfng', '/adnfng', createRemoteLoader({ preview })));

function prepareNative(slug: NativeSlug, page: PageRecord) {
  if (slug === 'home') return withSiteTabs(page);
  if (page.portfolio.pages.length && slug !== '404') return withHomeTab(rebaseTabs(page, `/${slug}`));
  return page;
}
