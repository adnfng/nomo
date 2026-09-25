import remarkFrontmatter from 'remark-frontmatter';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { parse as parseYaml } from 'yaml';
import { extractGalleries, extractLeadingBalls, extractLeadingImage, extractSections } from './blocks';
import { isRecord, legacyAvatar } from './config';
import type { PageRecord, PageSection } from './types';

export function parsePageRecord(raw: string, assetBase?: string, profileRoot?: string): PageRecord {
  const { body, metadata } = splitFrontmatter(raw);
  const { intro: source, sections } = extractSections(body);
  if (!sections.length && isSectionsPage(source)) return parseSectionsPage(source, assetBase, profileRoot);
  const balls = extractLeadingBalls(source);
  const leading = extractLeadingImage(balls.content);
  const { intro, tabs } = attachHomeTab(leading.content, sections);
  return {
    ...extractGalleries(intro, assetBase),
    intro,
    sections: tabs,
    assetBase,
    profileRoot,
    portfolio: {
      avatar: balls.balls ? undefined : leading.avatar ?? legacyAvatar(metadata),
      avatarWidth: balls.balls ? undefined : leading.avatarWidth,
      avatarHeight: balls.balls ? undefined : leading.avatarHeight,
      balls: balls.balls,
      pages: sectionPages(tabs),
    },
  };
}

const LEADING_NAME = /^(?:\s*\n)*#[ \t]+(.+?)[ \t]*#*[ \t]*(?:\n|$)/;

function rootAssets(markdown: string) {
  return markdown.replace(/(\]\(\s*)(?:\.\/)?assets\//g, '$1/assets/');
}

export function isSectionsPage(source: string) {
  const balls = extractLeadingBalls(source);
  const leading = extractLeadingImage(rootAssets(balls.content));
  return LEADING_NAME.test(leading.content);
}

function parseSectionsPage(source: string, assetBase?: string, profileRoot?: string): PageRecord {
  const balls = extractLeadingBalls(source);
  const leading = extractLeadingImage(rootAssets(balls.content));
  const match = leading.content.match(LEADING_NAME);
  const content = match ? leading.content.slice(match[0].length).replace(/^\s+/, '') : leading.content;
  return {
    content,
    galleries: {},
    layout: 'sections',
    name: match?.[1].trim(),
    assetBase,
    profileRoot,
    portfolio: {
      avatar: balls.balls ? undefined : leading.avatar,
      avatarWidth: balls.balls ? undefined : leading.avatarWidth,
      avatarHeight: balls.balls ? undefined : leading.avatarHeight,
      balls: balls.balls,
      pages: [],
    },
  };
}

function attachHomeTab(intro: string, sections: PageSection[]) {
  if (!intro.trim() || !sections.length) return { intro, tabs: sections };
  const [first, ...rest] = sections;
  return { intro: '', tabs: [{ ...first, content: `${intro.trim()}\n\n${first.content}` }, ...rest] };
}

function sectionPages(sections: PageSection[]) {
  return sections.map((section, index) => ({
    label: section.label,
    href: index === 0 ? '/' : `/content/${section.slug}`,
  }));
}

function splitFrontmatter(raw: string) {
  const tree = unified().use(remarkParse).use(remarkFrontmatter, ['yaml']).parse(raw);
  const header = tree.children.find(node => node.type === 'yaml');
  if (header?.type !== 'yaml') return { body: raw, metadata: {} as Record<string, unknown> };
  return {
    body: raw.slice(header.position?.end.offset).replace(/^\s+/, ''),
    metadata: readMetadata(header.value),
  };
}

function readMetadata(value: string): Record<string, unknown> {
  try {
    const parsed: unknown = parseYaml(value);
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}
