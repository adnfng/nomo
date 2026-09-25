import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Suspense } from 'react';
import { PageView } from '@/components/PageView';
import { SESSION_COOKIE, verifySession } from '@/lib/analytics/auth';
import { database } from '@/lib/analytics/db';
import { secret } from '@/lib/analytics/record';
import { buildReport, RANGES, reportMarkdown } from '@/lib/analytics/report';
import { parsePageRecord } from '@/lib/content/parse';
import { login } from './actions';

export const metadata: Metadata = { title: 'Analytics · Nomo', robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ days?: string; error?: string }> };

const ERRORS: Record<string, string> = {
  wrong: 'That password didn’t work.',
  wait: 'Too many tries. Wait a few minutes.',
};

function Message({ children }: { children: string }) {
  return <PageView page={parsePageRecord(children)} pathname="/analytics" native />;
}

function Login({ error }: { error?: string }) {
  return <main className="app-shell" data-layout="portfolio"><div className="page-wrap">
    <div className="page-content">
      <article className="markdown">
        <p><strong>Nomo analytics</strong></p>
        <form action={login} className="analytics-login">
          <input aria-label="Password" autoComplete="current-password" autoFocus className="analytics-login__input" name="password" placeholder="Password" required type="password" />
          <button className="retry-button" type="submit">Open</button>
        </form>
        {error && ERRORS[error] ? <p className="markdown-muted" role="alert">{ERRORS[error]}</p> : null}
      </article>
    </div>
  </div></main>;
}

async function isSignedIn() {
  if (!process.env.ANALYTICS_PASSWORD) return process.env.NODE_ENV !== 'production';
  return verifySession((await cookies()).get(SESSION_COOKIE)?.value, secret());
}

async function Dashboard({ searchParams }: Props) {
  const params = await searchParams;
  if (!await isSignedIn()) {
    if (!process.env.ANALYTICS_PASSWORD) return <Message>Set `ANALYTICS_PASSWORD` to open the dashboard.</Message>;
    return <Login error={params.error} />;
  }
  const sql = await database();
  if (!sql) return <Message>No analytics database. Set `DATABASE_URL`.</Message>;
  const days = RANGES.includes(Number(params.days)) ? Number(params.days) : 30;
  return <PageView page={parsePageRecord(reportMarkdown(await buildReport(sql, days)))} pathname="/analytics" native className="analytics" />;
}

export default function AnalyticsPage(props: Props) {
  return <Suspense fallback={<main className="app-shell" data-layout="portfolio" />}>
    <Dashboard {...props} />
  </Suspense>;
}
