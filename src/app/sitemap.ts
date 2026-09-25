import type { MetadataRoute } from 'next';
import { cacheLife } from 'next/cache';
import { database } from '@/lib/analytics/db';
import { SITE } from '@/lib/content/identity';
import { BUNDLED_USER, nativePages } from '@/lib/server/site';

async function knownProfiles() {
  'use cache';
  cacheLife('hours');
  const sql = await database();
  if (!sql) return [];
  const rows = await sql(`select profile from hits where profile is not null and status = 200 and not is_bot
    union select profile from daily where profile <> '' and bot = ''`);
  return rows.map(row => String(row.profile));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = nativePages();
  const sections = (slug: 'docs' | 'compare') => pages.get(slug)?.sections?.slice(1).map(section => `/${slug}/${section.slug}`) ?? [];
  const native = ['/', '/docs', ...sections('docs'), '/compare', ...sections('compare'), '/changelog'];
  const profiles = [...new Set([BUNDLED_USER, ...await knownProfiles()])].sort();
  return [
    ...native.map(path => ({ url: `${SITE}${path === '/' ? '' : path}`, changeFrequency: 'weekly' as const, priority: path === '/' ? 1 : 0.7 })),
    ...profiles.map(profile => ({ url: `${SITE}/${profile}`, changeFrequency: 'weekly' as const, priority: 0.5 })),
  ];
}
