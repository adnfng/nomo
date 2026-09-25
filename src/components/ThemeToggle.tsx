"use client";

import { useSyncExternalStore } from 'react';
import { THEME_KEY as KEY } from '@/lib/theme/script';

type ThemeName = 'light' | 'dark';

const EVENT = 'nomo-theme';

function current(): ThemeName {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}

function apply(name: ThemeName) {
  const root = document.documentElement;
  if (name === 'dark') root.dataset.theme = 'dark';
  else delete root.dataset.theme;
  root.style.colorScheme = name;
  try { localStorage.setItem(KEY, name); } catch { /* private mode */ }
  window.dispatchEvent(new Event(EVENT));
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M13.5 9.2A5.5 5.5 0 0 1 6.8 2.5 5.6 5.6 0 1 0 13.5 9.2Z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="8" cy="8" r="2.75" />
      <path d="M8 1.75v1.4M8 12.85v1.4M1.75 8h1.4M12.85 8h1.4M3.35 3.35l1 1M11.65 11.65l1 1M3.35 12.65l1-1M11.65 4.35l1-1" />
    </svg>
  );
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, current, () => 'light' as ThemeName);
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => apply(dark ? 'light' : 'dark')}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}