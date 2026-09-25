import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageView } from '@/components/PageView';
import { matchRoute } from '@/lib/content/routes';
import { blocks, fill, sections } from '@/lib/content/preview';
import { nativeDocument } from '@/lib/server/site';

export const metadata: Metadata = { title: 'Make it yours · Nomo', robots: { index: false } };

type Props = { searchParams: Promise<{ user?: string; error?: string; as?: string }> };

function username(value?: string) {
  const route = matchRoute(`/${value ?? ''}`);
  return route.type === 'profile-root' ? route.username : undefined;
}

async function Claim({ searchParams }: Props) {
  const params = await searchParams;
  const copy = blocks(nativeDocument.source('new'));
  const user = username(params.user);
  const as = username(params.as);
  const error = params.error && copy[`error-${params.error}`] && (params.error !== 'mismatch' || as) ? copy[`error-${params.error}`] : '';
  if (!user) return <PageView page={nativeDocument.focused(sections([error, copy.ask]))} pathname="/new" native className="markdown--centered" />;
  const signIn = process.env.GITHUB_APP_CLIENT_ID ? copy.signin : '';
  const markdown = fill(sections([copy.intro, error, copy.agent, signIn, copy.manual]), { user, as: as ?? '' });
  return <PageView page={nativeDocument.focused(markdown)} pathname="/new" native className="markdown--centered" />;
}

export default function NewPage(props: Props) {
  return <Suspense fallback={<main className="app-shell" data-layout="portfolio" />}>
    <Claim {...props} />
  </Suspense>;
}
