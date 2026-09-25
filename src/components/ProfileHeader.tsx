import Link from 'next/link';
import { navigationHref } from '../lib/content/presentation';
import type { PageRecord } from '../lib/content/types';
import { isNomoAvatar } from '../lib/content/config';
import { NomoMark3D } from './NomoMark3D';
import { PoolBalls } from './PoolBalls';

function AvatarLink({ avatar, width, height, home, round }: { avatar: string; width?: number; height?: number; home: string; round?: boolean }) {
  const mark = isNomoAvatar(avatar);
  const size = round && !width ? { width: 64, height: 64 } : { width: width ?? 100, height: height ?? 140 };
  return <div className="profile-avatar-wrap">
    <Link aria-label="Home" className={mark ? 'profile-avatar-link profile-avatar-link--mark' : 'profile-avatar-link'} href={home}>
      {mark ? <NomoMark3D /> : <img className={round && !width ? 'profile-avatar profile-avatar--round' : 'profile-avatar'} src={avatar} alt="" width={size.width} height={size.height} />}
    </Link>
  </div>;
}

function samePath(a: string, b: string) {
  const clean = (value: string) => value.replace(/\/+$/, '').toLowerCase() || '/';
  return clean(a) === clean(b);
}

export function showsName(page: PageRecord) {
  return page.layout === 'sections' && Boolean(page.name) && !page.portfolio.pages.length;
}

export function ProfileHeader({ page, pathname }: { page: PageRecord; pathname: string }) {
  const config = page.portfolio;
  const home = navigationHref('/', page.profileRoot);
  return <header className="profile-header">
    {config.balls ? <PoolBalls letters={config.balls} home={home} /> : config.avatar ? <AvatarLink avatar={config.avatar} width={config.avatarWidth} height={config.avatarHeight} home={home} round={page.layout === 'sections'} /> : null}
    {showsName(page) ? <h1 className="profile-name">{page.name}</h1> : null}
    {config.pages.length ? <nav className="profile-navigation" aria-label="Pages">
      {config.pages.map(item => {
        const href = navigationHref(item.href, page.profileRoot);
        return <Link key={item.href} href={href} aria-current={samePath(href, pathname) ? 'page' : undefined}>{item.label}</Link>;
      })}
    </nav> : null}
  </header>;
}
