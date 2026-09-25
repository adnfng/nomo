import Link from 'next/link';
import { claimHref } from '@/lib/content/preview';

export function PreviewBar({ login }: { login: string }) {
  return <aside className="preview-bar" aria-label="Preview">
    <span>This is a preview of @{login}’s page, made from their GitHub profile.</span>
    <Link className="preview-bar__action" href={claimHref(login)}>
      Make it yours
      <svg aria-hidden="true" fill="none" height="12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="12">
        <path d="M7 7h10v10" />
        <path d="M7 17 17 7" />
      </svg>
    </Link>
  </aside>;
}
