import remarkFrontmatter from 'remark-frontmatter';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { parse as parseYaml } from 'yaml';
import { extractGalleries, extractSections } from './blocks';
import { isRecord, parseExplicitFrontmatter, parsePortfolioConfig } from './config';
import { attachSectionPages } from './presentation';
import { DEFAULT_FRONTMATTER, type PageRecord } from './types';

export function parsePageRecord(raw: string, assetBase?: string, profileRoot?: string): PageRecord {
  const tree = unified().use(remarkParse).use(remarkFrontmatter, ['yaml']).parse(raw);
  const header = tree.children.find(node => node.type === 'yaml');
  let body = raw;
  let metadata: Record<string, unknown> = {};
  if (header?.type === 'yaml') {
    metadata = readMetadata(header.value);
    body = raw.slice(header.position?.end.offset).replace(/^\s+/, '');
  }
  const { intro, sections } = extractSections(body);
  const explicit = parseExplicitFrontmatter(metadata);
  return {
    ...extractGalleries(intro, assetBase),
    intro,
    sections,
    assetBase, profileRoot, explicit,
    frontmatter: { ...DEFAULT_FRONTMATTER, ...explicit },
    portfolio: attachSectionPages(parsePortfolioConfig(metadata.nomo), sections),
  };
}

function readMetadata(value: string): Record<string, unknown> {
  try {
    const parsed: unknown = parseYaml(value);
    return isRecord(parsed) ? parsed : {};
  } catch {
    // Invalid metadata must not make an otherwise readable page disappear.
    return {};
  }
}
