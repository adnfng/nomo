import { Link, NavLink } from 'react-router-dom';
import { navigationHref } from '../lib/content/presentation';
import type { PageRecord } from '../lib/content/types';
import { isNomoAvatar } from '../lib/content/config';
import { NomoMark3D } from './NomoMark3D';

function AvatarLink({ avatar, home }: { avatar: string; home: string }) {
  const mark = isNomoAvatar(avatar);
  return <div className="profile-avatar-wrap">
    <Link aria-label="Home" className={mark ? 'profile-avatar-link profile-avatar-link--mark' : 'profile-avatar-link'} to={home}>
      {mark ? <NomoMark3D /> : <img className="profile-avatar" src={avatar} alt="" width="96" height="96" />}
    </Link>
  </div>;
}

export function ProfileHeader({ page }: { page: PageRecord }) {
  const config = page.portfolio;
  if (!config) return null;
  const home = navigationHref('/', page.profileRoot);
  return <header className="profile-header">
    {config.avatar ? <AvatarLink avatar={config.avatar} home={home} /> : null}
    {config.pages.length > 1 ? <nav className="profile-navigation" aria-label={`${config.name} pages`}>
      {config.pages.map(item => <NavLink key={item.href} end to={navigationHref(item.href, page.profileRoot)}>{item.label}</NavLink>)}
    </nav> : null}
  </header>;
}
