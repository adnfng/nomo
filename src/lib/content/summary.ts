import type { PageRecord } from './types';

export function plainText(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/@@GALLERY:\d+@@/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)]\([^)]*\)/g, '$1')
    .replace(/\(\(|\)\)|\{\{|\}\}|::/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/[*_`>]/g, '')
    .replace(/\s*·\s*/g, ' · ')
    .replace(/\s+/g, ' ')
    .trim();
}

function clip(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ') > max * 0.6 ? cut.lastIndexOf(' ') : cut.length).replace(/[\s,.;:·-]+$/, '')}…`;
}

export function summarize(markdown: string, max = 160) {
  const paragraphs = markdown.split(/\n\s*\n/).map(plainText).filter(text => text.length > 1);
  const first = paragraphs.find(text => text.length >= 24) ?? paragraphs[0] ?? '';
  const next = paragraphs[paragraphs.indexOf(first) + 1];
  const joined = first.length < 70 && next ? `${/[.!?…:]$/.test(first) ? first : `${first}.`} ${next}` : first;
  return clip(joined, max);
}

export function profileName(page: PageRecord, fallback: string) {
  return page.sections?.[0]?.label ?? fallback;
}
