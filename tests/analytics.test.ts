import { PGlite } from '@electric-sql/pglite';
import { beforeEach, describe, expect, test } from 'bun:test';
import { checkPassword, createSession, createThrottle, verifySession } from '../src/lib/analytics/auth';
import { deviceFor, referrerHost, sourceFor, visitorHash } from '../src/lib/analytics/classify';
import { migrate, type Row, type Sql } from '../src/lib/analytics/db';
import { describeHit, profileFromPath, recordHit, rollup } from '../src/lib/analytics/record';
import { buildReport, reportMarkdown } from '../src/lib/analytics/report';

const SAFARI = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15';
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const GPTBOT = 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.2; +https://openai.com/gptbot';

describe('sources', () => {
  test.each([
    ['https://chatgpt.com/', null, 'chatgpt'],
    ['https://www.google.co.uk/', null, 'google'],
    ['https://t.co/abc', null, 'x'],
    ['https://news.ycombinator.com/item?id=1', null, 'hn'],
    ['https://nomo.md/docs', null, 'internal'],
    ['https://example.com/blog', null, 'other'],
    ['', 'chatgpt.com', 'chatgpt'],
    ['', null, 'direct'],
  ])('%s (utm %s) is %s', (referrer, utm, source) => {
    expect(sourceFor(referrerHost(referrer), utm)).toBe(source);
  });

  test('devices', () => {
    expect(deviceFor(SAFARI)).toBe('desktop');
    expect(deviceFor(IPHONE)).toBe('mobile');
  });

  test('profiles come from the path, never the client', () => {
    expect(profileFromPath('/AdnFng/timeline')).toBe('adnfng');
    expect(profileFromPath('/docs')).toBeNull();
    expect(profileFromPath('/preview')).toBeNull();
  });
});

describe('privacy', () => {
  test('the same person hashes the same within a day, and differently the next day', async () => {
    const today = await visitorHash('1.2.3.4', SAFARI, 'secret', '2026-09-25');
    expect(await visitorHash('1.2.3.4', SAFARI, 'secret', '2026-09-25')).toBe(today);
    expect(await visitorHash('1.2.3.4', SAFARI, 'secret', '2026-09-26')).not.toBe(today);
    expect(today).not.toContain('1.2.3.4');
  });

  test('bots get no visitor hash', async () => {
    const hit = await describeHit({ headers: new Headers({ 'user-agent': GPTBOT }), path: '/adnfng' });
    expect(hit).toMatchObject({ bot: 'GPTBot', visitor: null, profile: 'adnfng' });
  });
});

describe('dashboard auth', () => {
  test('sessions verify until they expire, and reject tampering', async () => {
    const token = await createSession('s', 0);
    expect(await verifySession(token, 's', 1)).toBe(true);
    expect(await verifySession(token, 'other', 1)).toBe(false);
    expect(await verifySession(token.replace(/^\d+/, '9'.repeat(15)), 's', 1)).toBe(false);
    expect(await verifySession(token, 's', 31 * 86_400_000)).toBe(false);
    expect(await verifySession(undefined, 's')).toBe(false);
  });

  test('passwords compare exactly', async () => {
    expect(await checkPassword('hunter2', 'hunter2', 's')).toBe(true);
    expect(await checkPassword('hunter', 'hunter2', 's')).toBe(false);
  });

  test('five wrong tries block for the window', () => {
    let time = 0;
    const throttle = createThrottle({ limit: 5, window: 100, now: () => time });
    for (let i = 0; i < 5; i++) throttle.count('ip');
    expect(throttle.blocked('ip')).toBe(true);
    time = 101;
    expect(throttle.blocked('ip')).toBe(false);
  });
});

describe('report', () => {
  let sql: Sql;

  beforeEach(async () => {
    const db = new PGlite();
    sql = async (text, params = []) => (await db.query<Row>(text, params)).rows;
    await migrate(sql);
  });

  async function view(path: string, userAgent: string, referrer = '', ip = '1.1.1.1', daysAgo = 0) {
    const now = new Date(Date.now() - daysAgo * 86_400_000);
    await recordHit(sql, await describeHit({ headers: new Headers({ 'user-agent': userAgent, 'x-forwarded-for': ip }), path, referrer, now }));
  }

  test('counts people and crawlers separately', async () => {
    await view('/adnfng', SAFARI, 'https://chatgpt.com/');
    await view('/adnfng/timeline', SAFARI, 'https://nomo.md/adnfng');
    await view('/', IPHONE, '', '2.2.2.2');
    await view('/adnfng', GPTBOT);
    await view('/adnfng', SAFARI, '', '3.3.3.3', 40);
    const report = await buildReport(sql, 30);
    expect(report).toMatchObject({ views: 3, visitors: 2, profiles: 1, allTime: 4 });
    expect(report.topProfiles).toEqual([{ label: 'adnfng', count: 2 }]);
    expect(report.sources).toEqual([{ label: 'chatgpt', count: 1 }, { label: 'direct', count: 1 }]);
    expect(report.crawlers).toEqual([{ label: 'GPTBot', count: 1 }]);
    expect(report.aiReads).toEqual([{ label: '/adnfng', count: 1 }]);
    const markdown = reportMarkdown(report);
    expect(markdown).toContain('- from AI assistants {{1}}');
    expect(markdown).toContain('- [adnfng](/adnfng) {{2}}');
  });

  test('rollups keep all-time totals after old hits are pruned', async () => {
    await view('/adnfng', SAFARI, '', '1.1.1.1', 100);
    await view('/adnfng', SAFARI, '', '1.1.1.1', 1);
    expect(await rollup(sql, 90)).toBe(1);
    expect((await buildReport(sql, 90)).allTime).toBe(2);
  });
});
