import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

export type Row = Record<string, unknown>;
export type Sql = (text: string, params?: unknown[]) => Promise<Row[]>;

const SCHEMA = [
  `create table if not exists hits (
    id bigserial primary key,
    ts timestamptz not null default now(),
    path text not null,
    profile text,
    referrer_host text,
    source text not null,
    country text,
    device text,
    visitor text,
    status int not null default 200,
    is_bot boolean not null default false,
    bot text
  )`,
  'create index if not exists hits_ts on hits (ts)',
  `create table if not exists daily (
    day date not null,
    profile text not null default '',
    source text not null default '',
    bot text not null default '',
    views int not null,
    visitors int not null,
    primary key (day, profile, source, bot)
  )`,
];

export async function migrate(sql: Sql) {
  for (const statement of SCHEMA) await sql(statement);
}

async function open(): Promise<Sql | null> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const { neon } = await import('@neondatabase/serverless');
    const client = neon(url);
    return (text, params = []) => client.query(text, params) as Promise<Row[]>;
  }
  if (process.env.VERCEL) return null;
  const { PGlite } = await import('@electric-sql/pglite');
  const directory = join(process.cwd(), '.data');
  await mkdir(directory, { recursive: true });
  const db = await PGlite.create(join(directory, 'pglite'));
  return async (text, params = []) => (await db.query<Row>(text, params)).rows;
}

const KEY = Symbol.for('nomo.analytics.db');
const store = ((globalThis as Record<symbol, unknown>)[KEY] ??= {}) as { sql?: Promise<Sql | null> };

export function database(): Promise<Sql | null> {
  store.sql ??= open()
    .then(async sql => { if (sql) await migrate(sql); return sql; })
    .catch(error => {
      console.error('Analytics database unavailable:', error);
      store.sql = undefined;
      return null;
    });
  return store.sql;
}
