import { extractGalleries, extractTimelines } from './blocks';
import { resolveAssetUrl, resolveContentHref } from './paths';
import { PORTFOLIO_FRONTMATTER, type PageRecord, type PageSection, type PortfolioConfig } from './types';

export function attachSectionPages(portfolio: PortfolioConfig | undefined, sections: PageSection[]): PortfolioConfig | undefined {
  if (!portfolio) return;
  if (portfolio.pages.length) return portfolio;
  return {
    ...portfolio,
    pages: [
      { label: portfolio.name, href: '/' },
      ...sections.map(section => ({ label: section.label, href: `/content/${section.slug}` })),
    ],
  };
}

export function selectSection(page: PageRecord, slug?: string): PageRecord | undefined {
  if (!page.sections?.length) return slug ? undefined : page;
  const raw = slug ? page.sections.find(section => section.slug === slug)?.content : page.intro;
  if (raw == null) return;
  return { ...page, ...extractGalleries(raw, page.assetBase) };
}

export function navigationHref(href: string, root = '') {
  return href === '/' ? root || '/' : resolveContentHref(href, root || '/')!.replace(/^\/\//, '/');
}

export function presentPage(page: PageRecord, root = page): PageRecord {
  const portfolio = page.portfolio ?? root.portfolio;
  if (!portfolio) return page;
  return {
    ...page,
    ...extractTimelines(page.content),
    portfolio: { ...portfolio, avatar: resolveAssetUrl(portfolio.avatar, root.assetBase) },
    frontmatter: { ...PORTFOLIO_FRONTMATTER, ...root.explicit, ...page.explicit },
  };
}

export function inheritPortfolio(page: PageRecord, root: PageRecord | undefined, pathname: string): PageRecord {
  if (page.portfolio) return presentPage(page);
  const listed = root?.portfolio?.pages.some(item => navigationHref(item.href, root.profileRoot) === pathname.replace(/\/$/, ''));
  return root && listed ? presentPage(page, root) : page;
}
