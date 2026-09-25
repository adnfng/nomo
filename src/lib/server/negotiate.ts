export const FILE = /\.(?:svg|png|jpe?g|webp|gif|ico|glb|mp4|webm|woff2?|md|txt|xml|json)$/i;

const STATIC_MARKDOWN = new Set(['/agents.md']);

export function markdownTarget(pathname: string, accept: string | null) {
  if (/\.md$/i.test(pathname)) {
    const single = !pathname.slice(1).includes('/');
    return single && !STATIC_MARKDOWN.has(pathname.toLowerCase()) ? `/api/md/${pathname.slice(1, -3)}` : null;
  }
  const wantsMarkdown = Boolean(accept?.includes('text/markdown')) && !accept?.includes('text/html');
  return wantsMarkdown && !FILE.test(pathname) ? `/api/md${pathname === '/' ? '' : pathname}` : null;
}
