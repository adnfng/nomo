import type { Metadata } from 'next';
import { Suspense } from 'react';
import { JsonLd } from '@/components/JsonLd';
import { PageView } from '@/components/PageView';
import { HOME_JSON_LD, profileJsonLd } from '@/lib/content/identity';
import { parsePageRecord } from '@/lib/content/parse';
import { brokenRepoMarkdown, previewMarkdown } from '@/lib/content/preview';
import { presentPage, selectSection } from '@/lib/content/presentation';
import type { PageResult } from '@/lib/content/resolver';
import { matchRoute } from '@/lib/content/routes';
import { profileName } from '@/lib/content/summary';
import { lookupGitHub } from '@/lib/server/github';
import { pageMetadata } from '@/lib/server/metadata';
import { getPage, pathFromSegments } from '@/lib/server/page-data';
import { BUNDLED_USER, nativePages } from '@/lib/server/site';

type Props = { params: Promise<{ path?: string[] }> };
type Route = ReturnType<typeof matchRoute>;

export async function generateStaticParams() {
  const pages = nativePages();
  const tabs = (slug: 'docs' | 'compare') => pages.get(slug)?.sections?.slice(1).map(section => ({ path: [slug, section.slug] })) ?? [];
  return [{ path: [] }, { path: ['docs'] }, ...tabs('docs'), { path: ['compare'] }, ...tabs('compare'), { path: ['changelog'] }, { path: [BUNDLED_USER] }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pathname = pathFromSegments((await params).path);
  const result = await getPage(pathname);
  const route = matchRoute(pathname);
  if (result.status === 'missing' && route.type === 'profile-root') {
    const lookup = await lookupGitHub(route.username);
    if (lookup.status === 'found') return { title: `${lookup.profile.name || lookup.profile.login} · Preview on Nomo`, robots: { index: false } };
  }
  return pageMetadata(pathname, result);
}

async function MissingProfile({ username, pathname, fallback }: { username: string; pathname: string; fallback: PageResult }) {
  const lookup = await lookupGitHub(username);
  if (lookup.status !== 'found') return <PageView page={fallback.page} pathname={pathname} native />;
  const markdown = lookup.hasRepo ? brokenRepoMarkdown(lookup.profile.login) : previewMarkdown(lookup.profile);
  const record = parsePageRecord(markdown, undefined, `/${username}`);
  return <PageView page={presentPage(selectSection(record) ?? record)} pathname={pathname} native={lookup.hasRepo} heading={lookup.profile.name || lookup.profile.login} />;
}

function heading(route: Route, result: PageResult) {
  if (!result.page) return undefined;
  if ('username' in route) return profileName(result.page, route.username);
  return route.type === 'native' && route.slug === 'home' ? 'Nomo' : undefined;
}

function structuredData(route: Route, result: PageResult) {
  if (result.status !== 'ready' || !result.page) return null;
  if (route.type === 'profile-root') return profileJsonLd(result.page, route.username);
  return route.type === 'native' && route.slug === 'home' ? HOME_JSON_LD : null;
}

async function Content({ params }: Props) {
  const pathname = pathFromSegments((await params).path);
  const result = await getPage(pathname);
  const route = matchRoute(pathname);
  if (result.status === 'missing' && route.type === 'profile-root') return <MissingProfile username={route.username} pathname={pathname} fallback={result} />;
  const data = structuredData(route, result);
  return <>
    {data && <JsonLd data={data} />}
    <PageView page={result.page} pathname={pathname} native={!('username' in route) || result.status !== 'ready'} heading={heading(route, result)} />
  </>;
}

export default function Page({ params }: Props) {
  return <Suspense fallback={<div className="page-wrap" />}>
    <Content params={params} />
  </Suspense>;
}
