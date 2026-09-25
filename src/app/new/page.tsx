import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageView } from '@/components/PageView';
import { matchRoute } from '@/lib/content/routes';
import { blocks, fill } from '@/lib/content/preview';
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
  if (!user) return <PageView page={nativeDocument.page([error, copy.ask].filter(Boolean).join('\n\n\n\n'))} pathname="/new" native />;
  const signIn = process.env.GITHUB_APP_CLIENT_ID ? copy.signin : '';
  const markdown = fill([copy.intro, error, signIn, copy.manual].filter(Boolean).join('\n\n\n\n'), { user, as: as ?? '' });
  return <PageView page={nativeDocument.page(markdown)} pathname="/new" native />;
}

export default function NewPage(props: Props) {
  return <Suspense fallback={<div className="page-wrap" />}>
    <Claim {...props} />
  </Suspense>;
}
