import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageView } from '@/components/PageView';
import { matchRoute } from '@/lib/content/routes';
import { getPage, pathFromSegments } from '@/lib/server/page-data';
import { pageMetadata } from '@/lib/server/metadata';
import { BUNDLED_USER, nativePages } from '@/lib/server/site';

type Props = { params: Promise<{ path?: string[] }> };

export async function generateStaticParams() {
  const pages = nativePages();
  const tabs = (slug: 'docs' | 'changelog') => pages.get(slug)?.sections?.slice(1).map(section => ({ path: [slug, section.slug] })) ?? [];
  return [{ path: [] }, { path: ['docs'] }, ...tabs('docs'), { path: ['changelog'] }, { path: [BUNDLED_USER] }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pathname = pathFromSegments((await params).path);
  return pageMetadata(pathname, await getPage(pathname));
}

async function Content({ params }: Props) {
  const pathname = pathFromSegments((await params).path);
  const result = await getPage(pathname);
  const route = matchRoute(pathname);
  return <PageView page={result.page} pathname={pathname} native={route.type === 'native' || route.type === 'not-found'} />;
}

export default function Page({ params }: Props) {
  return <Suspense fallback={<div className="page-wrap" />}>
    <Content params={params} />
  </Suspense>;
}
