import { ViewTransition } from 'react';
import type { PageRecord } from '../lib/content/types';
import { isNativeSite } from '../lib/content/routes';
import { Markdown } from '../lib/markdown/Markdown';
import { Footer } from './Footer';
import { ProfileHeader } from './ProfileHeader';

type Props = { page: PageRecord | null; pathname: string; native?: boolean; className?: string; heading?: string };

export function PageView({ page, pathname, native = isNativeSite(pathname), className, heading }: Props) {
  return <div className="page-wrap">
    <ViewTransition enter="nomo-page-in" exit="nomo-page-out" default="none">
      <div className="page-content">
        {heading && <h1 className="visually-hidden">{heading}</h1>}
        {page && <ProfileHeader page={page} pathname={pathname} />}
        <article className={className ? `markdown ${className}` : 'markdown'}>
          {page && <Markdown page={page} />}
        </article>
      </div>
    </ViewTransition>
    <Footer native={native} />
  </div>;
}
