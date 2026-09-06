import { Link, NavLink } from 'react-router-dom';
import { navigationHref } from '../lib/content/presentation';
import type { PageRecord } from '../lib/content/types';
import { isNomoAvatar } from '../lib/content/config';
import { NomoMark3D } from './NomoMark3D';
import { PoolBalls } from './PoolBalls';

function AvatarLink({ avatar, width, height, home }: { avatar: string; width?: number; height?: number; home: string }) {
  const mark = isNomoAvatar(avatar);
  return <div className="profile-avatar-wrap">
    <Link aria-label="Home" className={mark ? 'profile-avatar-link profile-avatar-link--mark' : 'profile-avatar-link'} to={home}>
      {mark ? <NomoMark3D /> : <img className="profile-avatar" src={avatar} alt="" width={width ?? 100} height={height ?? 140} />}
    </Link>
  </div>;
}

export function ProfileHeader({ page }: { page: PageRecord }) {
  const config = page.portfolio;
  const home = navigationHref('/', page.profileRoot);
  return <header className="profile-header">
    {config.balls ? <PoolBalls letters={config.balls} home={home} /> : config.avatar ? <AvatarLink avatar={config.avatar} width={config.avatarWidth} height={config.avatarHeight} home={home} /> : null}
    {config.pages.length ? <nav className="profile-navigation" aria-label="Pages">
      {config.pages.map(item => <NavLink key={item.href} end to={navigationHref(item.href, page.profileRoot)}>{item.label}</NavLink>)}
    </nav> : null}
  </header>;
}
