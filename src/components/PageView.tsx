import { ViewTransition, type ReactNode } from 'react';
import type { PageRecord } from '../lib/content/types';
import { isNativeSite } from '../lib/content/routes';
import { Markdown } from '../lib/markdown/Markdown';
import { Footer } from './Footer';
import { ProfileHeader, showsName } from './ProfileHeader';

type Props = { page: PageRecord | null; pathname: string; native?: boolean; className?: string; heading?: string; updated?: string; banner?: ReactNode };

export function PageView({ page, pathname, native = isNativeSite(pathname), className, heading, updated, banner }: Props) {
  const sections = page?.layout === 'sections';
  const classes = ['markdown', sections ? 'markdown--sections' : '', className ?? ''].filter(Boolean).join(' ');
  return <>
    {banner}
    <main className="app-shell" data-layout="portfolio">
      <div className="page-wrap">
        <ViewTransition enter="nomo-page-in" exit="nomo-page-out" default="none">
          <div className="page-content">
            {heading && !(page && showsName(page)) && <h1 className="visually-hidden">{heading}</h1>}
            {page && <ProfileHeader page={page} pathname={pathname} />}
            <article className={classes}>
              {page && <Markdown page={page} />}
            </article>
          </div>
        </ViewTransition>
        <Footer native={native} updated={updated} />
      </div>
    </main>
  </>;
}
