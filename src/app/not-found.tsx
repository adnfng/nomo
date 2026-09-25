import { PageView } from '@/components/PageView';
import { presentPage } from '@/lib/content/presentation';
import { nativePages } from '@/lib/server/site';

export default async function NotFound() {
  'use cache';
  const page = nativePages().get('404');
  return <PageView page={page ? presentPage(page) : null} pathname="/404" native />;
}
