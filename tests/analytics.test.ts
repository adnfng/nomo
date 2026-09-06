import { describe, expect, test } from 'bun:test';
import { applyHit, emptyStats, fillStats, isTrackedPath, parseHit } from '../src/lib/analytics/store';

describe('analytics store', () => {
  test('a new session is a visit and a view', () => {
    const next = applyHit(emptyStats(), { path: '/', session: 'aaaa-bbbb-cccc-dddd' });
    expect(next.views).toBe(1);
    expect(next.visits).toBe(1);
  });
  test('the same session only adds a view', () => {
    const first = applyHit(emptyStats(), { path: '/', session: 'aaaa-bbbb-cccc-dddd' });
    const next = applyHit(first, { path: '/docs', session: 'aaaa-bbbb-cccc-dddd' });
    expect(next.views).toBe(2);
    expect(next.visits).toBe(1);
  });
  test('a loaded profile is listed and counted', () => {
    const next = applyHit(emptyStats(), { path: '/adnfng', profile: 'adnfng' }, '2026-09-06T12:00:00.000Z');
    expect(next.profiles).toEqual([{ name: 'adnfng', views: 1, first: '2026-09-06T12:00:00.000Z', last: '2026-09-06T12:00:00.000Z' }]);
  });
  test('the same profile stays one row', () => {
    const first = applyHit(emptyStats(), { path: '/Alex', profile: 'Alex' }, '2026-09-06T12:00:00.000Z');
    const next = applyHit(first, { path: '/alex/work', profile: 'alex' }, '2026-09-06T13:00:00.000Z');
    expect(next.profiles).toEqual([{ name: 'alex', views: 2, first: '2026-09-06T12:00:00.000Z', last: '2026-09-06T13:00:00.000Z' }]);
  });
  test('analytics itself is not a tracked path', () => {
    expect(isTrackedPath('/analytics')).toBe(false);
    expect(parseHit({ path: '/analytics', session: 'aaaa-bbbb-cccc-dddd' })).toBeNull();
    expect(parseHit({ path: '/', profile: 'not a name' })).toEqual({ path: '/' });
  });
  test('markdown tokens fill with live counts', () => {
    const stats = applyHit(emptyStats(), { path: '/adnfng', profile: 'adnfng', session: 'aaaa-bbbb-cccc-dddd' });
    expect(fillStats('{{::views::}}\n%views%\n\n%seen%', stats)).toBe('{{::views::}}\n1\n\n- [adnfng](/adnfng) {{1}}');
  });
});
