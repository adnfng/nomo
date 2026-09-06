import { useLayoutEffect, useState } from 'react';
import light from '../../../public/themes/light.json';
import dark from '../../../public/themes/dark.json';

export type ThemeName = 'light' | 'dark';

const KEY = 'nomo-theme';
const NOMO = '"nomo", ui-sans-serif, system-ui, sans-serif';

function storedTheme(): ThemeName {
  try {
    return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function applyTheme(name: ThemeName) {
  const root = document.documentElement;
  const semantic = (name === 'dark' ? dark : light).semantic;
  root.dataset.theme = name;
  root.style.colorScheme = name;
  root.dataset.layout = 'portfolio';
  root.style.setProperty('--page-font-family', NOMO);
  root.style.setProperty('--page-font-size', '15px');
  root.style.setProperty('--page-line-height', '20.5px');
  root.style.setProperty('--page-letter-spacing', '-0.3px');
  for (const [key, value] of Object.entries(semantic)) root.style.setProperty(`--${key}`, value);
  root.style.setProperty('--background-overlay', name === 'dark' ? 'rgb(17 17 17 / 0.4)' : 'rgb(255 255 255 / 0.2)');
}

export function usePagePresentation() {
  const [theme, setTheme] = useState<ThemeName>('light');
  useLayoutEffect(() => {
    const next = storedTheme();
    setTheme(next);
    applyTheme(next);
  }, []);
  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(KEY, next); } catch { /* ignore quota / private mode */ }
    setTheme(next);
    applyTheme(next);
  }
  return { theme, toggle };
}
