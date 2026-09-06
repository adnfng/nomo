import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import { resolveAssetUrl } from './paths';
import type { GalleryMap, PageSection } from './types';

function codeLines(content: string) {
  const protectedLines = new Set<number>();
  const tree = unified().use(remarkParse).parse(content);
  visit(tree, 'code', node => {
    if (!node.position) return;
    for (let line = node.position.start.line; line <= node.position.end.line; line++) protectedLines.add(line - 1);
  });
  return protectedLines;
}

export function extractBlocks(content: string, kind: string, replace: (body: string[]) => string): string {
  const protectedLines = codeLines(content);
  const lines = content.split(/\r?\n/);
  const output: string[] = [];
  for (let index = 0; index < lines.length; index++) {
    if (protectedLines.has(index) || lines[index].trim() !== `[[${kind}]]`) {
      output.push(lines[index]);
      continue;
    }
    const end = findEnd(lines, index, kind, protectedLines);
    if (end < 0) {
      output.push(lines[index]);
      continue;
    }
    const replacement = replace(lines.slice(index + 1, end));
    if (replacement) output.push('', replacement, '');
    index = end;
  }
  return output.join('\n');
}

function findEnd(lines: string[], start: number, kind: string, protectedLines: Set<number>) {
  for (let index = start + 1; index < lines.length; index++) {
    if (!protectedLines.has(index) && lines[index].trim() === `[[/${kind}]]`) return index;
  }
  return -1;
}

export function extractGalleries(content: string, assetBase?: string) {
  const galleries: GalleryMap = {};
  let index = 0;
  const body = extractBlocks(content, 'gallery', lines => {
    const items = lines.map(line => line.trim()).filter(Boolean).map(line => {
      const source = line.match(/^!\[[^\]]*]\((.+?)\)$/)?.[1] ?? line;
      return resolveAssetUrl(source, assetBase) ?? source;
    });
    if (!items.length) return '';
    const token = `@@GALLERY:${index++}@@`;
    galleries[token] = { items };
    return token;
  });
  return { content: body, galleries };
}

function slugify(label: string) {
  return label.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function uniqueSlug(slug: string, used: Set<string>) {
  let next = slug;
  let count = 2;
  while (used.has(next)) next = `${slug}-${count++}`;
  used.add(next);
  return next;
}

export function extractSections(content: string) {
  const protectedLines = codeLines(content);
  const lines = content.split(/\r?\n/);
  const markers: Array<{ index: number; label: string; slug: string }> = [];
  const used = new Set<string>();
  for (let index = 0; index < lines.length; index++) {
    if (protectedLines.has(index)) continue;
    const match = lines[index].trim().match(/^={3,}\s+(.+?)\s+={3,}$/);
    if (!match) continue;
    const label = match[1].trim();
    const slug = slugify(label);
    if (!slug) continue;
    markers.push({ index, label, slug: uniqueSlug(slug, used) });
  }
  if (!markers.length) return { intro: content, sections: [] as PageSection[] };
  const sections = markers.map((marker, index) => {
    const end = markers[index + 1]?.index ?? lines.length;
    return { label: marker.label, slug: marker.slug, content: lines.slice(marker.index + 1, end).join('\n').replace(/^\n+|\n+$/g, '') };
  });
  return { intro: lines.slice(0, markers[0].index).join('\n').replace(/\s+$/, ''), sections };
}

export function extractTimelines(content: string) {
  const timelines: Record<string, string> = {};
  let index = 0;
  const body = extractBlocks(content, 'timeline', lines => {
    const token = `@@TIMELINE:${index++}@@`;
    timelines[token] = lines.join('\n');
    return token;
  });
  return { content: body, timelines };
}
