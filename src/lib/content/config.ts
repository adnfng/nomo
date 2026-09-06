import { DEFAULT_FRONTMATTER, type PageFrontmatter, type PortfolioConfig } from './types';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeFont(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : DEFAULT_FRONTMATTER.font;
}

function normalizeFontSize(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) return `${value}px`;
  if (typeof value !== 'string' || !value.trim()) return DEFAULT_FRONTMATTER.fontsize;
  const trimmed = value.trim();
  return /^\d+(\.\d+)?$/.test(trimmed) ? `${trimmed}px` : trimmed;
}

function parseAlign(value: unknown) {
  return value === 'middle' || value === 'bottom' ? value : 'top';
}

export function parseExplicitFrontmatter(raw: Record<string, unknown>): Partial<PageFrontmatter> {
  const result: Partial<PageFrontmatter> = {};
  if ('align' in raw) result.align = parseAlign(raw.align);
  if ('theme' in raw) result.theme = parseTheme(raw.theme);
  if ('font' in raw) result.font = normalizeFont(raw.font);
  const size = raw.fontsize ?? raw.fontSize ?? raw['font-size'] ?? raw['font size'];
  if (size !== undefined) result.fontsize = normalizeFontSize(size);
  return result;
}

function parseTheme(value: unknown) {
  return value === 'dark' || value === 'adn' || value === 'system' ? value : 'light';
}

function isNavigationItem(value: unknown): value is { label: string; href: string } {
  if (!isRecord(value) || typeof value.label !== 'string' || typeof value.href !== 'string') return false;
  return Boolean(value.label.trim()) && (value.href === '/' || /^\/content\/[a-z\d_-]+(?:\/[a-z\d_-]+)*(?:\.md)?$/i.test(value.href));
}

export function parsePortfolioConfig(value: unknown): PortfolioConfig | undefined {
  if (!isRecord(value) || value.version !== 2 || value.layout !== 'portfolio') return;
  if (typeof value.name !== 'string' || !value.name.trim()) return;
  const pages = 'pages' in value ? parseNavigation(value.pages) : [];
  if (!pages) return;
  return { version: 2, layout: 'portfolio', name: value.name.trim(), avatar: safeAvatar(value.avatar), pages };
}

export function isNomoAvatar(value: string) {
  return value === '/nomo.svg' || value === '/nomo.png';
}

function safeAvatar(value: unknown): string | undefined {
  if (typeof value !== 'string') return;
  return isNomoAvatar(value) || /^(\/assets\/|https?:\/\/)/i.test(value) ? value : undefined;
}

function parseNavigation(value: unknown) {
  if (!Array.isArray(value) || !value.length || !value.every(isNavigationItem)) return;
  const pages = value.map(item => ({ label: item.label.trim(), href: item.href.replace(/\.md$/i, '') }));
  if (new Set(pages.map(item => item.href)).size !== pages.length) return;
  return pages.some(item => item.href === '/') ? pages : undefined;
}
