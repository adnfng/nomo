import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { parsePageRecord } from '../src/lib/content/parse';
import { extractGalleries } from '../src/lib/content/blocks';
import { presentPage, inheritPortfolio, selectSection, rebaseTabs, withHomeTab, withSiteTabs } from '../src/lib/content/presentation';
import { Markdown } from '../src/lib/markdown/Markdown';
import { isNativeSite, matchRoute } from '../src/lib/content/routes';
import { createBundledLoader } from '../src/lib/content/bundled';
import { createRemoteLoader } from '../src/lib/content/remote';
import { createPageResolver } from '../src/lib/content/resolver';
import { resolveAssetUrl, resolveContentHref } from '../src/lib/content/paths';
import { isNomoAvatar } from '../src/lib/content/config';
import { LOGO_PALETTE } from '../src/lib/theme/nomoMark';

const root = parsePageRecord('![image:100x140](/assets/me.jpg)\n\n===== Alex =====\n\nHello\n\n===== Timeline =====\n\nYear', 'https://example.com/root', '/alex');
function render(page: ReturnType<typeof parsePageRecord>) {
  return renderToStaticMarkup(<MemoryRouter><Markdown page={page} /></MemoryRouter>);
}

describe('markdown pages', () => {
  for (const name of ['legacy-profile', 'legacy-components']) test(`${name} matches pre-refactor HTML`, async () => {
    const raw = await Bun.file(`tests/fixtures/${name}.md`).text();
    const expected = await Bun.file(`tests/fixtures/${name}.html`).text();
    const actual = render(parsePageRecord(raw, 'https://example.com/repo', '/someone')).replace(/ aria-label="Open (?:image|video) \d+"/g, '');
    expect(actual).toBe(expected);
  });
  test('YAML is stripped and ignored', () => {
    const page = parsePageRecord('---\ntheme: dark\nfontsize: 22\n---\nHello');
    expect(page.content).toBe('Hello');
    expect(page.portfolio.avatar).toBeUndefined();
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

describe('header, tabs, and extras', () => {
  test('leading image becomes the header photo', () => {
    expect(root.portfolio.avatar).toBe('/assets/me.jpg');
    expect(root.portfolio.avatarWidth).toBe(100);
    expect(root.portfolio.avatarHeight).toBe(140);
    expect(presentPage(root).portfolio.avatar).toBe('https://example.com/root/assets/me.jpg');
    expect(selectSection(root)?.content).toContain('Hello');
    expect(isNomoAvatar('/nomo.svg')).toBe(true);
    expect(isNomoAvatar('/nomo.png')).toBe(true);
    expect(isNomoAvatar('/assets/me.jpg')).toBe(false);
    expect(LOGO_PALETTE).toHaveLength(9);
  });
  test('old avatar frontmatter still becomes the header', () => {
    expect(parsePageRecord('---\nnomo:\n  avatar: /nomo.png\n---\nHello').portfolio.avatar).toBe('/nomo.png');
  });
  test('pool-ball letters replace the header photo', () => {
    const page = parsePageRecord('[[●ADN●]]\n\n===== Alex =====\n\nHello');
    expect(page.portfolio.balls).toBe('ADN');
    expect(page.portfolio.avatar).toBeUndefined();
    expect(selectSection(page)?.content).toContain('Hello');
  });
  test('a leading image wins over leftover avatar frontmatter', () => {
    const page = parsePageRecord('---\navatar: /assets/old.jpg\n---\n![](/nomo.png)\n\nHello');
    expect(page.portfolio.avatar).toBe('/nomo.png');
  });
  test('the first tab is home; later tabs keep their own urls', () => {
    expect(root.portfolio.pages).toEqual([{ label: 'Alex', href: '/' }, { label: 'Timeline', href: '/content/timeline' }]);
    expect(selectSection(root)?.content).toContain('Hello');
    expect(selectSection(root, 'timeline')?.content).toContain('Year');
    expect(render(presentPage(selectSection(root, 'timeline')!))).not.toContain('Hello');
  });
  test('section markers inside code stay literal', () => {
    expect(parsePageRecord('```md\n===== Timeline =====\n```').sections).toEqual([]);
  });
  test('legacy badges become ordinary text or links', () => {
    const html = render(parsePageRecord('((a badge)) (([nomo](https://nomo.md)))'));
    expect(html).toContain('a badge');
    expect(html).toContain('href="https://nomo.md"');
    expect(html).toContain('markdown-link--arrow');
    expect(html).toContain('markdown-link__icon');
    expect(html).not.toContain('markdown-badge');
    expect(html).not.toContain('markdown-muted');
    expect(html).not.toContain('((');
  });
  test('::text:: is small and can nest with mute', () => {
    const html = render(parsePageRecord('::small copy:: {{::quiet date::}}'));
    expect(html).toContain('markdown-small');
    expect(html).toContain('small copy');
    expect(html).toContain('quiet date');
    expect(html).toContain('markdown-muted');
    expect(html).not.toContain('::small');
  });
  test('a middle dot becomes a square', () => {
    const html = render(parsePageRecord('[IG](https://instagram.com) · [Github](https://github.com)'));
    expect(html).toContain('markdown-dot');
    expect(html).not.toContain('·');
    expect(render(parsePageRecord('`a · b`'))).toContain('·');
  });
  test('a normal link has no arrow; ((link)) does', () => {
    const html = render(parsePageRecord('[plain](https://nomo.md) (([arrow](https://nomo.md)))'));
    expect(html.match(/markdown-link__icon/g)?.length).toBe(1);
    expect(html).toContain('markdown-link--arrow');
    expect(html).toContain('>plain<');
  });
  test('subpages inherit the root header', () => {
    const page = parsePageRecord('{{::2026::}}\n\nWork', 'https://other.com', '/alex');
    const result = inheritPortfolio(page, root);
    expect(result.portfolio.avatar).toBe('https://example.com/root/assets/me.jpg');
    expect(result.portfolio.pages).toEqual([{ label: 'Alex', href: '/' }, { label: 'Timeline', href: '/content/timeline' }]);
    expect(render(result)).toContain('Work');
    expect(render(result)).toContain('markdown-small');
  });
  test('a missing root still presents the page', () => {
    const page = parsePageRecord('Hello');
    expect(inheritPortfolio(page).content).toBe('Hello');
  });
  test('gallery videos loop silently without controls', () => {
    const html = render(parsePageRecord('[[gallery]]\n/assets/clip.webm\n[[/gallery]]'));
    expect(html).toContain('src="/assets/clip.webm"');
    expect(html).toContain('loop');
    expect(html).toContain('muted');
    expect(html).toContain('autoPlay');
    expect(html).not.toContain('controls');
  });
  test('gallery works next to small labels', () => {
    const page = parsePageRecord('{{::Work::}}\n\n[[gallery]]\n/assets/me.jpg\n[[/gallery]]');
    expect(render(presentPage(page))).toContain('markdown-gallery__item');
  });
});

describe('routes and remote loading', () => {
  test('native, profile, nested, and invalid routes', () => {
    expect(matchRoute('/')).toMatchObject({ type: 'native', slug: 'home' });
    expect(matchRoute('/changelog')).toMatchObject({ type: 'native', slug: 'changelog' });
    expect(matchRoute('/analytics')).toMatchObject({ type: 'native', slug: 'analytics' });
    expect(matchRoute('/analytics/extra')).toMatchObject({ type: 'not-found' });
    expect(matchRoute('/docs/syntax')).toMatchObject({ type: 'native', slug: 'docs', section: 'syntax' });
    expect(matchRoute('/docs/a/b')).toMatchObject({ type: 'not-found' });
    expect(matchRoute('/-bad')).toMatchObject({ type: 'not-found' });
    expect(matchRoute('/Alex/nested/work')).toMatchObject({ type: 'profile-content', username: 'Alex', contentPath: 'nested/work' });
    expect(matchRoute('/preview')).toMatchObject({ type: 'profile-root', username: 'preview' });
    expect(matchRoute('/preview/timeline')).toMatchObject({ type: 'profile-content', username: 'preview', contentPath: 'timeline' });
    expect(isNativeSite('/')).toBe(true);
    expect(isNativeSite('/docs/syntax')).toBe(true);
    expect(isNativeSite('/changelog')).toBe(true);
    expect(isNativeSite('/analytics')).toBe(true);
    expect(isNativeSite('/-bad')).toBe(true);
    expect(isNativeSite('/adnfng')).toBe(false);
    expect(isNativeSite('/preview')).toBe(false);
  });
  test('the shipped adnfng page does not fetch GitHub', async () => {
    const urls: string[] = [];
    const load = createBundledLoader({ 'human.md': '===== Aidan =====\n\nHello' }, 'adnfng', '/adnfng', async url => {
      urls.push(String(url));
      return { status: 'ready', page: parsePageRecord('Remote') };
    });
    expect(await load('adnfng')).toMatchObject({ status: 'ready', page: { profileRoot: '/adnfng', sections: [{ content: 'Hello' }] } });
    expect(await load('alex')).toMatchObject({ status: 'ready', page: { content: 'Remote' } });
    expect(urls).toEqual(['alex']);
  });
  test('local preview only intercepts /preview, not GitHub usernames', async () => {
    const urls: string[] = [];
    const load = createRemoteLoader({
      preview: { username: 'preview', base: '/__nomo-local' },
      fetcher: (async url => { urls.push(String(url)); return new Response('Hello'); }) as typeof fetch,
    });
    expect(await load('preview')).toMatchObject({ status: 'ready', page: { profileRoot: '/preview' } });
    expect(await load('adnfng')).toMatchObject({ status: 'ready' });
    expect(urls[0]).toBe('/__nomo-local/human.md');
    expect(urls[1]).toContain('githubusercontent.com/adnfng/');
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
    const resolve = createPageResolver(new Map(), async (_user, path) => path ? { status: 'missing' } : { status: 'ready', page: root });
    expect(await resolve('/alex/timeline')).toMatchObject({ status: 'ready', page: { content: 'Year' } });
  });
  test('native docs and changelog are their own pages', async () => {
    const home = withSiteTabs(parsePageRecord('===== Nomo =====\n\nHome'));
    const docs = withHomeTab(rebaseTabs(parsePageRecord('===== Customization =====\n\nStart\n\n===== Syntax =====\n\nCode'), '/docs'));
    const changelog = parsePageRecord('Log');
    const resolve = createPageResolver(new Map([['home', home], ['docs', docs], ['changelog', changelog]]), async () => ({ status: 'missing' }));
    expect(await resolve('/')).toMatchObject({ isHome: true, page: { content: 'Home', portfolio: { pages: [{ href: '/' }, { href: '/docs' }, { href: '/changelog' }] } } });
    expect(await resolve('/docs')).toMatchObject({ slug: 'docs', page: { content: 'Start', portfolio: { pages: [{ href: '/' }, { href: '/docs' }, { href: '/docs/syntax' }] } } });
    expect(await resolve('/docs/syntax')).toMatchObject({ slug: 'syntax', page: { content: 'Code' } });
    expect(await resolve('/changelog')).toMatchObject({ slug: 'changelog', page: { content: 'Log' } });
    expect(await resolve('/docs/missing')).toMatchObject({ status: 'missing' });
  });
  test('direct subpage load inherits the root header; slug home is not native home', async () => {
    const resolve = createPageResolver(new Map(), async (_user, path) => ({ status: 'ready', page: path ? parsePageRecord('Content', undefined, '/alex') : root }));
    expect(await resolve('/alex/timeline')).toMatchObject({ status: 'ready', page: { portfolio: { avatar: 'https://example.com/root/assets/me.jpg' } } });
    expect(await resolve('/alex/home')).toMatchObject({ isHome: false });
  });
  test('root failure does not hide a valid subpage', async () => {
    const resolve = createPageResolver(new Map(), async (_user, path) => path ? { status: 'ready', page: parsePageRecord('Content') } : { status: 'error' });
    expect(await resolve('/alex/work')).toMatchObject({ status: 'ready', page: { content: 'Content' } });
  });
});
