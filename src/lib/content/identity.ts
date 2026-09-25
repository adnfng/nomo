import type { PageRecord } from './types';
import { isNomoAvatar } from './config';
import { profileName, summarize } from './summary';

export const SITE = 'https://nomo.md';

const SOCIAL = /^(github\.com|x\.com|twitter\.com|linkedin\.com|instagram\.com|bsky\.app|threads\.net|youtube\.com|dribbble\.com|behance\.net|read\.cv|mastodon\.social|twitch\.tv|tiktok\.com|medium\.com|dev\.to|substack\.com|[a-z0-9-]+\.substack\.com)$/;

export function linksIn(markdown: string) {
  const found = new Set<string>();
  for (const match of markdown.matchAll(/\]\((https?:\/\/[^\s)]+)\)|<(https?:\/\/[^\s>]+)>|(?<![(<"])\bhttps?:\/\/[^\s)<>\]]+/g)) {
    found.add((match[1] ?? match[2] ?? match[0]).replace(/[.,;:]+$/, ''));
  }
  return [...found];
}

const HANDLE_ONLY = /^(github\.com|x\.com|twitter\.com|instagram\.com|threads\.net|dribbble\.com|behance\.net|tiktok\.com|twitch\.tv|read\.cv|dev\.to|medium\.com)$/;

function isProfileUrl(url: string) {
  const name = host(url);
  if (!SOCIAL.test(name)) return false;
  const segments = new URL(url).pathname.split('/').filter(Boolean);
  return segments.length > 0 && (!HANDLE_ONLY.test(name) || segments.length === 1);
}

function host(url: string) {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

export function sameAs(markdown: string, username: string) {
  const github = `https://github.com/${username}`;
  const social = linksIn(markdown).filter(isProfileUrl);
  return [...new Set([github, ...social.filter(url => url.toLowerCase() !== github.toLowerCase())])];
}

export function absolute(url: string, base = SITE) {
  try {
    return new URL(url, base).toString();
  } catch {
    return undefined;
  }
}

export function profileImage(page: PageRecord) {
  const avatar = page.portfolio.avatar;
  return avatar && !isNomoAvatar(avatar) ? absolute(avatar) : undefined;
}

export function canonicalPath(pathname: string, username?: string) {
  if (!username) return pathname;
  return pathname.replace(/^\/[^/]+/, `/${username.toLowerCase()}`);
}

export function profileJsonLd(page: PageRecord, username: string) {
  const url = `${SITE}/${username.toLowerCase()}`;
  const source = [page.intro, ...(page.sections ?? []).map(section => section.content), page.content].join('\n');
  const image = profileImage(page);
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url,
    mainEntity: {
      '@type': 'Person',
      name: profileName(page, username),
      alternateName: username,
      url,
      description: summarize(page.content) || undefined,
      ...(image ? { image } : {}),
      sameAs: sameAs(source, username),
    },
  };
}

export const HOME_JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Nomo',
    url: SITE,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Nomo',
    url: SITE,
    applicationCategory: 'WebApplication',
    operatingSystem: 'Any',
    description: 'A free, open-source personal page for developers. Make a public GitHub repo called .nomo with a human.md file, and it becomes your page at nomo.md/your-username.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    license: 'https://opensource.org/licenses/MIT',
    codeRepository: 'https://github.com/adnfng/nomo',
  },
];
