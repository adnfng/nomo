import { describe, expect, test } from 'bun:test';
import { classifyBot, HTML_LIMITED_BOTS } from '../src/lib/bots';
import { parsePageRecord } from '../src/lib/content/parse';
import { summarize } from '../src/lib/content/summary';
import { pageTitle } from '../src/lib/server/metadata';
import { createProfileStatus } from '../src/lib/server/profile-status';

function statuses(codes: (number | Error)[]) {
  const calls: string[] = [];
  const fetcher = (async (url: string) => {
    calls.push(url);
    const next = codes.shift() ?? 404;
    if (next instanceof Error) throw next;
    return new Response(null, { status: next });
  }) as unknown as typeof fetch;
  return { calls, fetcher };
}

describe('profile status', () => {
  test('a human.md on main or master is live', async () => {
    const { calls, fetcher } = statuses([404, 200]);
    expect(await createProfileStatus({ fetcher })('Alex')).toBe('live');
    expect(calls).toEqual(['https://raw.githubusercontent.com/Alex/.nomo/main/human.md', 'https://raw.githubusercontent.com/Alex/.nomo/master/human.md']);
  });

  test('404 on both branches is missing, and is cached', async () => {
    const { calls, fetcher } = statuses([404, 404]);
    const status = createProfileStatus({ fetcher });
    expect(await status('alex')).toBe('missing');
    expect(await status('ALEX')).toBe('missing');
    expect(calls).toHaveLength(2);
  });

  test('GitHub errors are unknown and are not cached', async () => {
    const { calls, fetcher } = statuses([503, new Error('offline'), 200]);
    const status = createProfileStatus({ fetcher });
    expect(await status('alex')).toBe('unknown');
    expect(await status('alex')).toBe('live');
    expect(calls).toHaveLength(3);
  });

  test('bundled profiles never touch the network', async () => {
    const { calls, fetcher } = statuses([]);
    expect(await createProfileStatus({ fetcher, always: ['adnfng'] })('AdnFng')).toBe('live');
    expect(calls).toHaveLength(0);
  });
});

describe('page summaries and titles', () => {
  test('the first real paragraph becomes plain text, skipping short headings', () => {
    expect(summarize('# Hi\n\n**Designer** at [Acme](https://acme.co) · London\n\n((More)) text here')).toBe('Designer at Acme · London. More text here');
  });

  test('long summaries end on a word', () => {
    const text = summarize('word '.repeat(80));
    expect(text.length).toBeLessThanOrEqual(160);
    expect(text.endsWith('word…')).toBe(true);
  });

  test('profile titles use the first tab name, and tabs add their label', () => {
    const page = parsePageRecord('===== Aidan Fang =====\nHello\n===== Work =====\nThings');
    expect(pageTitle('/adnfng', { page, slug: '', isHome: false, status: 'ready' })).toBe('Aidan Fang');
    expect(pageTitle('/adnfng/work', { page, slug: 'work', isHome: false, status: 'ready' })).toBe('Work · Aidan Fang');
    expect(pageTitle('/nobody', { page: null, slug: '', isHome: false, status: 'missing' })).toBe('Not found · Nomo');
  });
});

describe('bots', () => {
  test.each([
    ['Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot', 'ChatGPT-User'],
    ['Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)', 'ClaudeBot'],
    ['Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)', 'PerplexityBot'],
  ])('%s', (ua, name) => {
    expect(classifyBot(ua)?.name).toBe(name);
    expect(new RegExp(HTML_LIMITED_BOTS, 'i').test(ua)).toBe(true);
  });

  test('browsers are people', () => {
    const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15';
    expect(classifyBot(ua)).toBeUndefined();
    expect(new RegExp(HTML_LIMITED_BOTS, 'i').test(ua)).toBe(false);
  });
});
