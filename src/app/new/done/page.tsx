import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { PageView } from '@/components/PageView';
import { matchRoute } from '@/lib/content/routes';
import { blocks, fill } from '@/lib/content/preview';
import { nativeDocument } from '@/lib/server/site';

export const metadata: Metadata = { title: 'Your page is live · Nomo', robots: { index: false } };

type Props = { searchParams: Promise<{ user?: string; existing?: string }> };

async function Done({ searchParams }: Props) {
  const params = await searchParams;
  const route = matchRoute(`/${params.user ?? ''}`);
  if (route.type !== 'profile-root') redirect('/new');
  const copy = blocks(nativeDocument.source('claimed'));
  const markdown = fill([params.existing ? copy.existing : copy.created, copy.next].join('\n\n\n\n'), { user: route.username.toLowerCase() });
  return <PageView page={nativeDocument.page(markdown)} pathname="/new/done" native />;
}

export default function DonePage(props: Props) {
  return <Suspense fallback={<main className="app-shell" data-layout="portfolio" />}>
    <Done {...props} />
  </Suspense>;
}
