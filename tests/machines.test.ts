import { describe, expect, test } from 'bun:test';
import { canonicalPath, linksIn, profileJsonLd, sameAs } from '../src/lib/content/identity';
import { parsePageRecord } from '../src/lib/content/parse';
import { presentPage, selectSection } from '../src/lib/content/presentation';
import { brokenRepoMarkdown, escapeMarkdown, previewMarkdown, type GitHubProfile } from '../src/lib/content/preview';
import { markdownPath, pageMetadata } from '../src/lib/server/metadata';
import { markdownTarget } from '../src/lib/server/negotiate';

const ALEX: GitHubProfile = {
  login: 'alexdev',
  name: 'Alex Dev',
  bio: 'I build *fast* things :: sometimes',
  avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
  blog: 'alex.dev',
  company: '@acme',
  location: 'Berlin',
  twitter: 'alexdev',
  socials: [{ provider: 'twitter', url: 'https://twitter.com/alexdev' }, { provider: 'bluesky', url: 'https://bsky.app/profile/alex.dev' }],
  repos: [{ name: 'fastlib', description: 'A fast library', url: 'https://github.com/alexdev/fastlib' }],
};

describe('identity', () => {
  test('links are found in markdown links, angle links and bare urls', () => {
    expect(linksIn('[x](https://x.com/a) <https://bsky.app/profile/a> see https://github.com/a.')).toEqual(['https://x.com/a', 'https://bsky.app/profile/a', 'https://github.com/a']);
  });

  test('sameAs keeps social profiles, always includes GitHub, and drops other sites', () => {
    expect(sameAs('[x](https://x.com/alex) [shop](https://shop.example.com) [home](https://x.com/) [repo](https://github.com/alex/tool) [in](https://linkedin.com/in/alex)', 'alex')).toEqual(['https://github.com/alex', 'https://x.com/alex', 'https://linkedin.com/in/alex']);
  });

  test('canonical profile paths are lowercase', () => {
    expect(canonicalPath('/AdnFng/Timeline', 'AdnFng')).toBe('/adnfng/Timeline');
    expect(canonicalPath('/docs')).toBe('/docs');
  });

  test('profile JSON-LD describes a person', () => {
    const page = parsePageRecord('![image:100x140](https://example.com/me.jpg)\n\n===== Alex Dev =====\nDeveloper in Berlin. [X](https://x.com/alexdev)\n===== Work =====\n[GitHub](https://github.com/alexdev)');
    const data = profileJsonLd(presentPage(selectSection(page) ?? page), 'AlexDev');
    expect(data).toMatchObject({ '@type': 'ProfilePage', url: 'https://nomo.md/alexdev', mainEntity: { '@type': 'Person', name: 'Alex Dev', image: 'https://example.com/me.jpg' } });
    expect(data.mainEntity.sameAs).toEqual(['https://github.com/AlexDev', 'https://x.com/alexdev']);
  });

  test('metadata has a canonical on nomo.md, a social card, and a markdown alternate', () => {
    const page = parsePageRecord('===== Alex =====\nI make developer tools that are small and fast.');
    const meta = pageMetadata('/Alex', { page, slug: 'alex', isHome: false, status: 'ready' });
    expect(meta.alternates).toEqual({ canonical: 'https://nomo.md/alex', types: { 'text/markdown': '/alex.md' } });
    expect(meta.openGraph).toMatchObject({ images: [{ url: '/api/og/alex' }] });
    expect(markdownPath('/')).toBe('/index.md');
  });
});

describe('markdown for agents', () => {
  test.each([
    ['/adnfng.md', null, '/api/md/adnfng'],
    ['/docs.md', null, '/api/md/docs'],
    ['/AGENTS.md', null, null],
    ['/adnfng/assets/notes.md', null, null],
    ['/adnfng', 'text/markdown', '/api/md/adnfng'],
    ['/', 'text/markdown, */*', '/api/md'],
    ['/adnfng', 'text/html,application/xhtml+xml,text/markdown', null],
    ['/adnfng', 'text/html', null],
  ])('%s with Accept %s goes to %s', (path, accept, target) => {
    expect(markdownTarget(path, accept)).toBe(target);
  });
});

describe('empty page preview', () => {
  test('is a real human.md built from the GitHub profile', () => {
    const markdown = previewMarkdown(ALEX);
    expect(markdown.startsWith('![Alex Dev](https://avatars.githubusercontent.com/u/1?v=4)\n\n# Alex Dev')).toBe(true);
    expect(markdown).not.toContain('{{');
    expect(markdown).toContain('acme · Berlin');
    expect(markdown).toContain('[alex.dev](https://alex.dev) · [GitHub](https://github.com/alexdev) · [X](https://x.com/alexdev) · [Bluesky](https://bsky.app/profile/alex.dev)');
    expect(markdown).toContain('## Projects\n\n- [fastlib](https://github.com/alexdev/fastlib) · A fast library');
  });

  test('user text cannot inject Nomo or Markdown syntax', () => {
    expect(escapeMarkdown('I build *fast* things :: [x](y)')).toBe('I build \\*fast\\* things \\:\\: \\[x\\]\\(y\\)');
    const page = parsePageRecord(previewMarkdown(ALEX));
    expect(page.layout).toBe('sections');
    expect(page.name).toBe('Alex Dev');
    expect(page.portfolio.avatar).toBe('https://avatars.githubusercontent.com/u/1?v=4');
  });

  test('a repo without human.md says what to do', () => {
    expect(brokenRepoMarkdown('alexdev')).toContain('github.com/alexdev/.nomo');
  });
});
