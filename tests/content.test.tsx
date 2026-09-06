import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { parsePageRecord } from '../src/lib/content/parse';
import { extractGalleries } from '../src/lib/content/blocks';
import { presentPage, inheritPortfolio, selectSection } from '../src/lib/content/presentation';
import { Markdown } from '../src/lib/markdown/Markdown';
import { matchRoute } from '../src/lib/content/routes';
import { createRemoteLoader } from '../src/lib/content/remote';
import { createPageResolver } from '../src/lib/content/resolver';
import { DEFAULT_FRONTMATTER } from '../src/lib/content/types';
import { resolveAssetUrl, resolveContentHref } from '../src/lib/content/paths';
import { isNomoAvatar } from '../src/lib/content/config';
import { LOGO_PALETTE } from '../src/lib/theme/nomoMark';

const rootRaw = `---
nomo:
  version: 2
  layout: portfolio
  name: Alex
  avatar: /assets/me.jpg
  pages:
    - label: Alex
      href: /
    - label: Timeline
      href: /content/timeline
theme: dark
---
Hello`;
const root = parsePageRecord(rootRaw, 'https://example.com/root', '/alex');
function render(page: ReturnType<typeof parsePageRecord>) {
  return renderToStaticMarkup(<MemoryRouter><Markdown page={page} /></MemoryRouter>);
}

describe('legacy compatibility', () => {
  for (const name of ['legacy-profile', 'legacy-components']) test(`${name} matches pre-refactor HTML`, async () => {
    const raw = await Bun.file(`tests/fixtures/${name}.md`).text();
    const expected = await Bun.file(`tests/fixtures/${name}.html`).text();
    // Accessible gallery trigger names are the only intentional markup addition besides silent video flags.
    const actual = render(parsePageRecord(raw, 'https://example.com/repo', '/someone')).replace(/ aria-label="Open (?:image|video) \d+"/g, '');
    expect(actual).toBe(expected);
  });
  test('legacy defaults and aliases', () => {
    expect(parsePageRecord('Hello').frontmatter).toEqual(DEFAULT_FRONTMATTER);
    for (const key of ['fontsize', 'fontSize', 'font-size', 'font size']) {
      expect(parsePageRecord(`---\n${key}: 17\n---\nHi`).frontmatter.fontsize).toBe('17px');
    }
  });
  test('invalid YAML keeps readable body', () => {
    expect(parsePageRecord('---\na: [\n---\nHello').content).toBe('Hello');
  });
  test('asset and page rewriting', () => {
    expect(resolveAssetUrl('/assets/x.jpg', 'https://example.com')).toBe('https://example.com/assets/x.jpg');
    expect(resolveContentHref('/content/nested/work.md', '/alex')).toBe('/alex/nested/work');
    expect(resolveContentHref('/', '/alex')).toBe('/');
  });
  test.each(['```md\n[[gallery]]\nx.jpg\n[[/gallery]]\n````', '    [[gallery]]\n    x.jpg\n    [[/gallery]]'])('code examples stay code: %s', content => {
    expect(extractGalleries(content).galleries).toEqual({});
  });
  test('valid longer closing fence does not swallow subsequent gallery', () => {
    const raw = '```md\nexample\n````\n\n[[gallery]]\nx.jpg\n[[/gallery]]';
    expect(Object.values(extractGalleries(raw).galleries)).toEqual([{ items: ['x.jpg'] }]);
  });
  test('unclosed blocks remain literal', () => expect(extractGalleries('[[gallery]]\nx.jpg').content).toBe('[[gallery]]\nx.jpg'));
});

describe('portfolio opt-in', () => {
  test('site logo paths are accepted avatars', () => {
    const raw = rootRaw.replace('/assets/me.jpg', '/nomo.png');
    expect(parsePageRecord(raw).portfolio?.avatar).toBe('/nomo.png');
    expect(isNomoAvatar('/nomo.svg')).toBe(true);
    expect(isNomoAvatar('/nomo.png')).toBe(true);
    expect(isNomoAvatar('/assets/me.jpg')).toBe(false);
    expect(LOGO_PALETTE).toHaveLength(9);
  });
  test('complete opt-in applies typography and root settings', () => {
    expect(presentPage(root).frontmatter).toEqual({ align: 'top', theme: 'dark', font: 'Helvetica Neue', fontsize: '15px' });
  });
  test.each(['version: 3', 'version: 1', 'version: nope'])('unknown version stays legacy: %s', replacement => {
    expect(parsePageRecord(rootRaw.replace('version: 2', replacement)).portfolio).toBeUndefined();
  });
  test('invalid navigation and incomplete opt-in stay legacy', () => {
    expect(parsePageRecord(rootRaw.replace('/content/timeline', 'javascript:alert(1)')).portfolio).toBeUndefined();
    expect(parsePageRecord('---\nnomo: {layout: portfolio}\n---\nHello').portfolio).toBeUndefined();
    expect(parsePageRecord(rootRaw.replace('/content/timeline', '/')).portfolio).toBeUndefined();
  });
  test('opt-in without pages is valid; sections become tabs', () => {
    const page = parsePageRecord('---\nnomo:\n  version: 2\n  layout: portfolio\n  name: Alex\n---\nHello\n\n===== Timeline =====\n\n### 2026\n\nWork');
    expect(page.portfolio?.pages).toEqual([{ label: 'Alex', href: '/' }, { label: 'Timeline', href: '/content/timeline' }]);
    expect(selectSection(page)?.content).toContain('Hello');
    expect(selectSection(page, 'timeline')?.content).toContain('### 2026');
    expect(render(presentPage(selectSection(page, 'timeline')!))).not.toContain('Hello');
  });
  test('section markers inside code stay literal', () => {
    const page = parsePageRecord('---\nnomo:\n  version: 2\n  layout: portfolio\n  name: Alex\n---\n```md\n===== Timeline =====\n```');
    expect(page.sections).toEqual([]);
  });
  test('legacy badges become muted text or ordinary links', () => {
    const html = render(parsePageRecord('((a badge)) (([nomo](https://nomo.md)))'));
    expect(html).toContain('class="markdown-muted"');
    expect(html).toContain('href="https://nomo.md"');
    expect(html).not.toContain('markdown-badge');
  });
  test('listed page inherits header, root asset source, and explicit overrides', () => {
    const page = parsePageRecord('---\nfontsize: 18\n---\n[[timeline]]\n### 2026\n\nWork\n[[/timeline]]', 'https://other.com', '/alex');
    const result = inheritPortfolio(page, root, '/alex/timeline');
    expect(result.frontmatter).toEqual({ align: 'top', theme: 'dark', font: 'Helvetica Neue', fontsize: '18px' });
    expect(result.portfolio?.avatar).toBe('https://example.com/root/assets/me.jpg');
    expect(render(result)).toContain('class="markdown-timeline"');
    expect(render(result)).not.toContain('[[timeline]]');
  });
  test('unlisted pages and missing root retain legacy presentation', () => {
    const page = parsePageRecord('[[timeline]]\n### 2026\n[[/timeline]]');
    expect(inheritPortfolio(page, root, '/alex/unlisted')).toBe(page);
    expect(inheritPortfolio(page, undefined, '/alex/timeline')).toBe(page);
    expect(render(page)).toContain('[[timeline]]');
  });
  test('timeline examples inside code and unclosed wrappers remain literal', () => {
    for (const body of ['```md\n[[timeline]]\n### 2026\n[[/timeline]]\n```', '[[timeline]]\n### 2026']) {
      expect(render(presentPage({ ...root, content: body }))).not.toContain('class="markdown-timeline"');
    }
  });
  test('gallery videos loop silently without controls', () => {
    const html = render(parsePageRecord('[[gallery]]\n/assets/clip.webm\n[[/gallery]]'));
    expect(html).toContain('src="/assets/clip.webm"');
    expect(html).toContain('loop');
    expect(html).toContain('muted');
    expect(html).toContain('autoPlay');
    expect(html).not.toContain('controls');
  });
  test('gallery works inside timeline', () => {
    const page = parsePageRecord(rootRaw.replace('Hello', '[[timeline]]\n### Work\n\n[[gallery]]\n/assets/me.jpg\n[[/gallery]]\n[[/timeline]]'));
    expect(render(presentPage(page))).toContain('markdown-gallery__item');
  });
});

describe('routes and remote loading', () => {
  test('native, profile, nested, and invalid routes', () => {
    expect(matchRoute('/')).toMatchObject({ type: 'native', slug: 'home' });
    expect(matchRoute('/changelog')).toMatchObject({ type: 'native', slug: 'changelog' });
    expect(matchRoute('/docs/child')).toMatchObject({ type: 'not-found' });
    expect(matchRoute('/-bad')).toMatchObject({ type: 'not-found' });
    expect(matchRoute('/Alex/nested/work')).toMatchObject({ type: 'profile-content', username: 'Alex', contentPath: 'nested/work' });
  });
  test('root and human subpage have distinct caches; concurrent loads deduplicate', async () => {
    const urls: string[] = [];
    const load = createRemoteLoader({ fetcher: (async url => { urls.push(String(url)); return new Response(String(url)); }) as typeof fetch });
    const [a, b] = await Promise.all([load('alex'), load('ALEX')]);
    expect(a).toBe(b);
    await load('alex', 'human');
    expect(urls).toHaveLength(2);
    expect(urls[0]).toEndWith('/human.md');
    expect(urls[1]).toEndWith('/content/human.md');
  });
  test('branch/CDN order and selected asset base are preserved', async () => {
    const urls: string[] = [];
    const load = createRemoteLoader({ fetcher: (async url => { urls.push(String(url)); return new Response('Hello', { status: urls.length === 3 ? 200 : 404 }); }) as typeof fetch });
    const result = await load('alex');
    expect(urls).toEqual(['https://raw.githubusercontent.com/alex/.nomo/main/human.md', 'https://cdn.jsdelivr.net/gh/alex/.nomo@main/human.md', 'https://raw.githubusercontent.com/alex/.nomo/master/human.md']);
    expect(result).toMatchObject({ status: 'ready', page: { assetBase: 'https://raw.githubusercontent.com/alex/.nomo/master' } });
  });
  test('CDN success rewrites repo assets against CDN', async () => {
    let calls = 0;
    const load = createRemoteLoader({ fetcher: (async () => new Response('[[gallery]]\n/assets/a.jpg\n[[/gallery]]', { status: ++calls === 2 ? 200 : 503 })) as typeof fetch });
    expect(await load('alex')).toMatchObject({ status: 'ready', page: { assetBase: 'https://cdn.jsdelivr.net/gh/alex/.nomo@main' } });
  });
  test.each([404, 503])('unsuccessful requests can be retried: %s', async status => {
    let calls = 0;
    const load = createRemoteLoader({ fetcher: (async () => { calls++; return new Response('Hello', { status: calls <= 4 ? status : 200 }); }) as typeof fetch });
    expect(await load('alex')).toMatchObject({ status: status === 404 ? 'missing' : 'error' });
    expect(await load('alex')).toMatchObject({ status: 'ready' });
    expect(calls).toBe(5);
  });
  test('successful cached loads expire', async () => {
    let time = 0; let calls = 0;
    const load = createRemoteLoader({ now: () => time, ttl: 10, fetcher: (async () => { calls++; return new Response('Hello'); }) as typeof fetch });
    await load('alex'); await load('alex'); time = 11; await load('alex');
    expect(calls).toBe(2);
  });
  test('fetches receive a bounded abort signal', async () => {
    const load = createRemoteLoader({ timeout: 1, fetcher: ((_url, init) => new Promise((_resolve, reject) => init?.signal?.addEventListener('abort', () => reject(new Error('Timed out'))))) as typeof fetch });
    expect(await load('alex')).toEqual({ status: 'error' });
  });
  test('in-file section tabs load from human.md without a separate file', async () => {
    const rootWithSections = parsePageRecord('---\nnomo:\n  version: 2\n  layout: portfolio\n  name: Alex\n---\nHello\n\n===== Timeline =====\n\nYear', undefined, '/alex');
    const resolve = createPageResolver(new Map(), async (_user, path) => path ? { status: 'missing' } : { status: 'ready', page: rootWithSections });
    expect(await resolve('/alex/timeline')).toMatchObject({ status: 'ready', page: { content: 'Year', portfolio: { name: 'Alex' } } });
  });
  test('direct listed subpage load resolves root configuration; slug home is not native home', async () => {
    const resolve = createPageResolver(new Map(), async (_user, path) => ({ status: 'ready', page: path ? parsePageRecord('Content', undefined, '/alex') : root }));
    expect(await resolve('/alex/timeline')).toMatchObject({ status: 'ready', page: { portfolio: { name: 'Alex' } } });
    expect(await resolve('/alex/home')).toMatchObject({ isHome: false });
  });
  test('root failure does not hide a valid subpage', async () => {
    const resolve = createPageResolver(new Map(), async (_user, path) => path ? { status: 'ready', page: parsePageRecord('Content') } : { status: 'error' });
    expect(await resolve('/alex/work')).toMatchObject({ status: 'ready', page: { content: 'Content' } });
  });
});
