import Link from 'next/link';
import { claimHref } from '@/lib/content/preview';

export function PreviewBar({ login }: { login: string }) {
  return <aside className="preview-bar" aria-label="Preview">
    <span className="preview-bar__text">This is a preview of @{login}’s page, made from their GitHub profile.</span>
    <Link className="preview-bar__action" href={claimHref(login)}>Make it yours</Link>
  </aside>;
}
