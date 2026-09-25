import { AI_KINDS, BOTS } from '../bots';
import { AI_SOURCES } from './classify';
import type { Sql } from './db';

export type Count = { label: string; count: number };
export type Report = {
  days: number;
  views: number;
  visitors: number;
  profiles: number;
  allTime: number;
  series: { label: string; views: number; visitors: number }[];
  topProfiles: Count[];
  sources: Count[];
  referrers: Count[];
  crawlers: Count[];
  aiReads: Count[];
};

export const RANGES = [7, 30, 90];

const AI_BOTS = BOTS.filter(bot => AI_KINDS.includes(bot.kind)).map(bot => bot.name);
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function shortDate(value: unknown) {
  const date = new Date(value instanceof Date ? value : String(value));
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}`;
}

function counts(rows: Record<string, unknown>[]): Count[] {
  return rows.map(row => ({ label: String(row.label ?? ''), count: Number(row.count) }));
}

export async function buildReport(sql: Sql, days: number): Promise<Report> {
  const since = `ts > now() - ($1::int * interval '1 day')`;
  const people = `not is_bot and ${since}`;
  const bucket = days <= 7 ? 'day' : 'week';
  const [totals, allTime, series, topProfiles, sources, referrers, crawlers, aiReads] = await Promise.all([
    sql(`select count(*)::int as views, count(distinct visitor)::int as visitors, count(distinct profile)::int as profiles from hits where ${people}`, [days]),
    sql(`select ((select count(*) from hits where not is_bot) + (select coalesce(sum(views), 0) from daily where bot = ''))::int as views`),
    sql(`select date_trunc('${bucket}', ts) as bucket, count(*)::int as views, count(distinct visitor)::int as visitors from hits where ${people} group by 1 order by 1`, [days]),
    sql(`select profile as label, count(*)::int as count from hits where ${people} and profile is not null group by 1 order by 2 desc, 1 limit 10`, [days]),
    sql(`select source as label, count(*)::int as count from hits where ${people} and source <> 'internal' group by 1 order by 2 desc, 1`, [days]),
    sql(`select referrer_host as label, count(*)::int as count from hits where ${people} and referrer_host is not null and source not in ('internal') group by 1 order by 2 desc, 1 limit 10`, [days]),
    sql(`select bot as label, count(*)::int as count from hits where is_bot and ${since} group by 1 order by 2 desc, 1 limit 15`, [days]),
    sql(`select path as label, count(*)::int as count from hits where is_bot and status = 200 and ${since} and bot = any($2) group by 1 order by 2 desc, 1 limit 10`, [days, AI_BOTS]),
  ]);
  return {
    days,
    views: Number(totals[0]?.views ?? 0),
    visitors: Number(totals[0]?.visitors ?? 0),
    profiles: Number(totals[0]?.profiles ?? 0),
    allTime: Number(allTime[0]?.views ?? 0),
    series: series.map(row => ({ label: shortDate(row.bucket), views: Number(row.views), visitors: Number(row.visitors) })),
    topProfiles: counts(topProfiles),
    sources: counts(sources),
    referrers: counts(referrers),
    crawlers: counts(crawlers),
    aiReads: counts(aiReads),
  };
}

const number = (value: number) => value.toLocaleString('en-US');
const escape = (value: string) => value.replace(/([\\`*_[\]{}()#|<>~:])/g, '\\$1');

function list(rows: Count[], empty: string, label: (row: Count) => string = row => escape(row.label)) {
  return rows.length ? rows.map(row => `- ${label(row)} {{${number(row.count)}}}`).join('\n') : `{{${empty}}}`;
}

function section(title: string, body: string) {
  return `#### ${title}\n\n${body}`;
}

export function reportMarkdown(report: Report) {
  const ai = report.sources.filter(row => AI_SOURCES.includes(row.label));
  const aiTotal = ai.reduce((sum, row) => sum + row.count, 0);
  const ranges = RANGES.map(days => days === report.days ? `${days} days` : `[${days} days](/analytics?days=${days})`).join(' · ');
  return [
    `**Nomo analytics**\n{{${ranges}}}`,
    [`- views {{${number(report.views)}}}`, `- visitors {{${number(report.visitors)}}}`, `- profiles viewed {{${number(report.profiles)}}}`, `- from AI assistants {{${number(aiTotal)}}}`].join('\n'),
    section(`${report.days <= 7 ? 'By day' : 'By week'} {{views · visitors}}`, report.series.length ? report.series.map(row => `- ${row.label} {{${number(row.views)} · ${number(row.visitors)}}}`).join('\n') : '{{No views yet.}}'),
    section('Profiles', list(report.topProfiles, 'No profile views yet.', row => `[${escape(row.label)}](/${row.label})`)),
    section('Sources', list(report.sources, 'No views yet.')),
    section('Referrers', list(report.referrers, 'No referrers yet.')),
    section('Crawlers', list(report.crawlers, 'No crawler visits yet.')),
    section('Pages AI read', list(report.aiReads, 'No AI crawler visits yet.')),
    `{{${number(report.allTime)} views all time. Views and visitors exclude bots. Visitors are counted per day, without cookies.}}`,
  ].join('\n\n');
}
