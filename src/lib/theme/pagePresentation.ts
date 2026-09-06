import { useLayoutEffect } from 'react';
import light from '../../../public/themes/light.json';
import dark from '../../../public/themes/dark.json';
import type { PageRecord, ThemeName } from '../content/types';

const SYSTEM_FONT_STACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
const HELVETICA_FONT_STACK = '"Helvetica Neue", Helvetica, Arial, sans-serif';

function applyFont(font: string) {
  const root = document.documentElement;
  const existing = document.getElementById('page-font-link');
  const local = font.toLowerCase();
  if (local === 'system' || local === 'helvetica neue') {
    root.style.setProperty('--page-font-family', local === 'system' ? SYSTEM_FONT_STACK : HELVETICA_FONT_STACK);
    existing?.remove();
    return;
  }
  root.style.setProperty('--page-font-family', `"${font}", ${SYSTEM_FONT_STACK}`);
  const link = existing instanceof HTMLLinkElement ? existing : document.createElement('link');
  link.id = 'page-font-link';
  link.rel = 'stylesheet';
  const family = encodeURIComponent(font.trim()).replace(/%20/g, '+');
  link.href = `https://fonts.googleapis.com/css2?family=${family}:wght@400;500;600;700&display=swap`;
  if (!existing) document.head.append(link);
}

function resolveTheme(theme: ThemeName, prefersDark: boolean) {
  if (theme === 'system') return prefersDark ? 'dark' : 'light';
  return theme === 'dark' ? 'dark' : 'light'; // Preserve the legacy `adn` value as a light-theme alias.
}

function applyTheme(page: PageRecord, prefersDark: boolean) {
  const root = document.documentElement;
  const name = resolveTheme(page.frontmatter.theme, prefersDark);
  const semantic = { ...(name === 'dark' ? dark : light).semantic, ...(page.portfolio && name === 'light' ? { background: '#ffffff', text: '#333333', muted: '#767676', subtle: '#767676', link: '#5199de' } : {}) };
  root.style.colorScheme = name;
  root.dataset.layout = page.portfolio ? 'portfolio' : 'legacy';
  for (const [key, value] of Object.entries(semantic)) root.style.setProperty(`--${key}`, value);
  root.style.setProperty('--background-overlay', name === 'dark' ? 'rgb(23 23 23 / 0.2)' : 'rgb(250 250 250 / 0.2)');
}

export function usePagePresentation(page: PageRecord | null) {
  useLayoutEffect(() => {
    if (!page) return;
    document.documentElement.style.setProperty('--page-font-size', page.frontmatter.fontsize);
    applyFont(page.frontmatter.font);
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => applyTheme(page, query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, [page]);
}
