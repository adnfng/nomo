import { ViewTransition } from 'react';
import type { PageRecord } from '../lib/content/types';
import { isNativeSite } from '../lib/content/routes';
import { Markdown } from '../lib/markdown/Markdown';
import { Footer } from './Footer';
import { ProfileHeader } from './ProfileHeader';

export function PageView({ page, pathname, native = isNativeSite(pathname), className }: { page: PageRecord | null; pathname: string; native?: boolean; className?: string }) {
  return <div className="page-wrap">
    <ViewTransition enter="nomo-page-in" exit="nomo-page-out" default="none">
      <div className="page-content">
        {page && <ProfileHeader page={page} pathname={pathname} />}
        <article className={className ? `markdown ${className}` : "markdown"}>
          {page && <Markdown page={page} />}
        </article>
      </div>
    </ViewTransition>
    <Footer native={native} />
  </div>;
}
