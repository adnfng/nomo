import { extractGalleries, extractTimelines } from './blocks';
import { resolveAssetUrl, resolveContentHref } from './paths';
import type { PageRecord } from './types';

export function selectSection(page: PageRecord, slug?: string): PageRecord | undefined {
  if (!page.sections?.length) return slug ? undefined : page;
  const section = slug ? page.sections.find(item => item.slug === slug) : page.sections[0];
  if (!section) return;
  return { ...page, ...extractGalleries(section.content, page.assetBase) };
}

export function navigationHref(href: string, root = '') {
  return href === '/' ? root || '/' : resolveContentHref(href, root || '/')!.replace(/^\/\//, '/');
}

export function presentPage(page: PageRecord, root = page): PageRecord {
  const source = page.portfolio.avatar ? page.portfolio : root.portfolio;
  return {
    ...page,
    ...extractTimelines(page.content),
    portfolio: {
      avatar: resolveAssetUrl(source.avatar, root.assetBase),
      avatarWidth: source.avatarWidth,
      avatarHeight: source.avatarHeight,
      balls: page.portfolio.balls ?? root.portfolio.balls,
      pages: page.portfolio.pages.length ? page.portfolio.pages : root.portfolio.pages,
    },
  };
}

export function inheritPortfolio(page: PageRecord, root?: PageRecord): PageRecord {
  return presentPage(page, root ?? page);
}

const SITE_TABS = [{ label: 'Docs', href: '/docs' }, { label: 'Changelog', href: '/changelog' }];

export function withSiteTabs(page: PageRecord): PageRecord {
  const pages = page.portfolio.pages;
  const extra = SITE_TABS.filter(tab => !pages.some(item => item.href === tab.href || item.href === `/content${tab.href}`));
  return { ...page, portfolio: { ...page.portfolio, pages: [...pages, ...extra] } };
}

export function rebaseTabs(page: PageRecord, base: string): PageRecord {
  return {
    ...page,
    portfolio: {
      ...page.portfolio,
      pages: page.portfolio.pages.map((item, index) => ({
        ...item,
        href: index === 0 ? base : `${base}/${item.href.replace(/^\/content\//, '')}`,
      })),
    },
  };
}
