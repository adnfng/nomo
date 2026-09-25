import { describe, expect, test } from 'bun:test';
import { seal, unseal } from '../src/lib/crypto';
import { blocks, claimMarkdown, expandPinned, fill, type GitHubProfile, starCount, withoutPhoto } from '../src/lib/content/preview';
import { parsePageRecord } from '../src/lib/content/parse';
import { claimPage } from '../src/lib/server/claim';

const PROFILE: GitHubProfile = {
  login: 'alexdev', name: 'Alex Dev', bio: 'I build tools.', avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
  blog: null, company: null, location: 'Berlin', twitter: null, socials: [], repos: [],
};

type Call = { method: string; url: string; body?: Record<string, unknown> };

function fakeGitHub({ login = 'alexdev', repoExists = false, generate = 201 } = {}) {
  const calls: Call[] = [];
  let created = false;
  const fetcher = (async (input: string, init: RequestInit = {}) => {
    const url = String(input);
    const method = init.method ?? 'GET';
    calls.push({ method, url, body: init.body ? JSON.parse(String(init.body)) : undefined });
    if (url.startsWith('https://avatars.')) return new Response(new Uint8Array([1, 2, 3]), { headers: { 'content-type': 'image/png' } });
    const path = url.replace('https://api.github.com', '');
    if (path === '/user') return Response.json({ login });
    if (path === `/repos/${login}/.nomo`) return new Response(null, { status: repoExists ? 200 : 404 });
    if (path === '/repos/adnfng/.nomo/generate') { created = generate === 201; return new Response(null, { status: generate }); }
    if (path.startsWith(`/repos/${login}/.nomo/contents/`) && method === 'GET') return created ? Response.json({ sha: `sha-${path.split('/').pop()}` }) : new Response(null, { status: 404 });
    if (method === 'PUT') return new Response(null, { status: 200 });
    return new Response(null, { status: 404 });
  }) as unknown as typeof fetch;
  return { calls, fetcher };
}

const noWait = async () => {};

describe('make it yours', () => {
  test('creates the repo from the template, then commits the photo and the preview as human.md', async () => {
    const github = fakeGitHub();
    expect(await claimPage('AlexDev', PROFILE, { token: 't', fetcher: github.fetcher, wait: noWait })).toEqual({ status: 'created', login: 'alexdev' });
    const writes = github.calls.filter(call => call.method !== 'GET');
    expect(writes.map(call => `${call.method} ${call.url.replace('https://api.github.com', '')}`)).toEqual([
      'POST /repos/adnfng/.nomo/generate',
      'PUT /repos/alexdev/.nomo/contents/assets/me.jpg',
      'PUT /repos/alexdev/.nomo/contents/human.md',
    ]);
    expect(writes[0].body).toMatchObject({ owner: 'alexdev', name: '.nomo', private: false });
    const human = Buffer.from(String(writes[2].body?.content), 'base64').toString();
    expect(human).toBe(claimMarkdown(PROFILE));
    expect(human.startsWith('![Alex Dev](assets/me.jpg)\n\n# Alex Dev')).toBe(true);
    expect(human).not.toContain('doesn’t have a page yet');
    expect(writes[2].body?.sha).toBe('sha-human.md');
  });

  test('you can only claim your own username', async () => {
    const github = fakeGitHub({ login: 'someoneelse' });
    expect(await claimPage('alexdev', PROFILE, { token: 't', fetcher: github.fetcher, wait: noWait })).toEqual({ status: 'mismatch', login: 'someoneelse' });
    expect(github.calls.filter(call => call.method !== 'GET')).toHaveLength(0);
  });

  test('an existing .nomo is never touched', async () => {
    const github = fakeGitHub({ repoExists: true });
    expect(await claimPage('alexdev', PROFILE, { token: 't', fetcher: github.fetcher, wait: noWait })).toEqual({ status: 'existing', login: 'alexdev' });
    expect(github.calls.filter(call => call.method !== 'GET')).toHaveLength(0);
  });

  test('a GitHub refusal is reported, not hidden', async () => {
    const github = fakeGitHub({ generate: 403 });
    expect(await claimPage('alexdev', PROFILE, { token: 't', fetcher: github.fetcher, wait: noWait })).toMatchObject({ status: 'failed' });
  });

  test('sign-in state is signed and tamper-proof', async () => {
    const token = await seal('s', { user: 'alexdev', nonce: 'n', exp: 1 });
    expect(await unseal<Record<string, unknown>>('s', token)).toEqual({ user: 'alexdev', nonce: 'n', exp: 1 });
    expect(await unseal('other', token)).toBeNull();
    const forged = `${Buffer.from(JSON.stringify({ user: 'torvalds', nonce: 'n', exp: 1 })).toString('base64url')}.${token.split('.')[1]}`;
    expect(await unseal('s', forged)).toBeNull();
  });

  test('the first human.md is plain markdown that renders as a sections page', () => {
    const human = claimMarkdown(PROFILE);
    const page = parsePageRecord(human, '/alexdev/', '/alexdev');
    expect(page.layout).toBe('sections');
    expect(page.name).toBe('Alex Dev');
    expect(page.portfolio.avatar).toBe('/assets/me.jpg');
    expect(human).toContain('<!-- github:pinned -->');
    expect(withoutPhoto(human).startsWith('# Alex Dev')).toBe(true);
  });

  test('the pinned directive becomes rows of repos', () => {
    const repos = [{ name: 'nomo', description: 'Pages from GitHub', url: 'https://github.com/a/nomo', stars: 12 }, { name: 'x', description: null, url: 'https://github.com/a/x' }];
    expect(expandPinned('## Projects\n\n<!-- github:pinned -->\n', repos)).toBe('## Projects\n\n- [nomo](https://github.com/a/nomo) · Pages from GitHub · 12\u00a0stars\n- [x](https://github.com/a/x)\n');
    expect(expandPinned('<!-- github:pinned -->', [])).toBe('');
  });

  test('star counts are short words', () => {
    expect([1, 12, 999, 1_234, 250_141, 1_500_000].map(starCount)).toEqual(['1 star', '12 stars', '999 stars', '1.2k stars', '250.1k stars', '1.5m stars'].map(text => text.replace(' ', '\u00a0')));
  });

  test('page copy is split into named blocks and filled in', async () => {
    const copy = blocks(await Bun.file('site/claimed.md').text());
    expect(Object.keys(copy)).toEqual(['created', 'existing', 'next']);
    expect(fill(copy.created, { user: 'alexdev' })).toContain('(([nomo.md/alexdev](/alexdev)))');
    expect(fill(copy.next, { user: 'alexdev' })).not.toContain('%user%');
  });
});
