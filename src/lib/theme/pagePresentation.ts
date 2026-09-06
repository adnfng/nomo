import { useLayoutEffect } from 'react';
import light from '../../../public/themes/light.json';
import dark from '../../../public/themes/dark.json';

const HELVETICA = '"Helvetica Neue", Helvetica, Arial, sans-serif';

function applyTheme(prefersDark: boolean) {
  const root = document.documentElement;
  const name = prefersDark ? 'dark' : 'light';
  const semantic = (name === 'dark' ? dark : light).semantic;
  root.style.colorScheme = name;
  root.dataset.layout = 'portfolio';
  root.style.setProperty('--page-font-family', HELVETICA);
  root.style.setProperty('--page-font-size', '15px');
  for (const [key, value] of Object.entries(semantic)) root.style.setProperty(`--${key}`, value);
  root.style.setProperty('--background-overlay', name === 'dark' ? 'rgb(23 23 23 / 0.4)' : 'rgb(250 250 250 / 0.2)');
}

export function usePagePresentation() {
  useLayoutEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => applyTheme(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
}
