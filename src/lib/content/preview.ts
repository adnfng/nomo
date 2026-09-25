export type GitHubProfile = {
  login: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string;
  blog: string | null;
  company: string | null;
  location: string | null;
  twitter: string | null;
  socials: { provider: string; url: string }[];
  repos: { name: string; description: string | null; url: string; stars?: number }[];
};

const PROVIDERS: Record<string, string> = {
  twitter: 'X', linkedin: 'LinkedIn', bluesky: 'Bluesky', mastodon: 'Mastodon', instagram: 'Instagram',
  youtube: 'YouTube', twitch: 'Twitch', facebook: 'Facebook', reddit: 'Reddit', npm: 'npm', hometown: 'Mastodon',
};

export function escapeMarkdown(text: string) {
  return text.replace(/\s+/g, ' ').trim().replace(/([\\`*_[\]{}()#+!<>|~:=])/g, '\\$1');
}

function website(blog: string | null) {
  if (!blog?.trim()) return null;
  const url = /^https?:\/\//i.test(blog) ? blog.trim() : `https://${blog.trim()}`;
  try {
    return { label: new URL(url).hostname.replace(/^www\./, ''), url };
  } catch {
    return null;
  }
}

function links(profile: GitHubProfile) {
  const list: { label: string; url: string }[] = [];
  const site = website(profile.blog);
  if (site) list.push(site);
  list.push({ label: 'GitHub', url: `https://github.com/${profile.login}` });
  if (profile.twitter) list.push({ label: 'X', url: `https://x.com/${profile.twitter}` });
  for (const social of profile.socials) {
    const label = PROVIDERS[social.provider] ?? social.provider;
    if (!list.some(item => item.label === label || item.url === social.url)) list.push({ label, url: social.url });
  }
  return list.map(item => `[${escapeMarkdown(item.label)}](${encodeURI(item.url)})`).join(' · ');
}

export function claimHref(login: string) {
  return `/new?user=${encodeURIComponent(login)}`;
}

export const PINNED_DIRECTIVE = '<!-- github:pinned -->';

export function repoRows(repos: GitHubProfile['repos']) {
  return repos.slice(0, 6).map(repo => {
    const notes = [repo.description ? escapeMarkdown(repo.description) : '', repo.stars ? `★ ${repo.stars}` : ''].filter(Boolean).join(' · ');
    return `- [${escapeMarkdown(repo.name)}](${encodeURI(repo.url)})${notes ? ` · ${notes}` : ''}`;
  }).join('\n');
}

function header(profile: GitHubProfile, avatar: string) {
  const name = escapeMarkdown(profile.name || profile.login);
  const about = [profile.company, profile.location].filter(Boolean).map(value => escapeMarkdown(String(value).replace(/^@/, ''))).join(' · ');
  return [`![${name}](${avatar})`, `# ${name}`, profile.bio ? escapeMarkdown(profile.bio) : '', about, links(profile)];
}

export function previewMarkdown(profile: GitHubProfile) {
  return [
    ...header(profile, profile.avatarUrl),
    profile.repos.length ? `## Projects\n\n${repoRows(profile.repos.slice(0, 4))}` : '',
  ].filter(Boolean).join('\n\n');
}

export function claimMarkdown(profile: GitHubProfile) {
  return `${[
    ...header(profile, 'assets/me.jpg'),
    `## Projects\n\n${PINNED_DIRECTIVE}`,
  ].filter(Boolean).join('\n\n')}\n`;
}

export function withoutPhoto(markdown: string) {
  return markdown.replace(/^!\[[^\]]*\]\([^)]*\)\n\n/, '');
}

export function expandPinned(markdown: string, repos: GitHubProfile['repos']) {
  return markdown.replace(new RegExp(`^[ \\t]*${PINNED_DIRECTIVE}[ \\t]*$`, 'm'), repos.length ? repoRows(repos) : '');
}

export function blocks(source: string) {
  const found: Record<string, string> = {};
  for (const part of source.split(/^%% /m).slice(1)) {
    const [name, ...lines] = part.split('\n');
    found[name.trim()] = lines.join('\n').trim();
  }
  return found;
}

export function sections(parts: string[]) {
  return parts.filter(Boolean).join('\n\n\n\n\n\n');
}

export function fill(markdown: string, values: Record<string, string>) {
  return markdown.replace(/%(\w+)%/g, (match, key: string) => values[key] ?? match);
}

export function brokenRepoMarkdown(login: string) {
  return [
    `# @${login}`,
    `There’s a \`.nomo\` repo, but no \`human.md\` in it yet. Add a \`human.md\` at the top of [github.com/${login}/.nomo](https://github.com/${login}/.nomo) on the \`main\` branch, and this page shows up within a minute.`,
    '[How to write it](/docs)',
  ].join('\n\n');
}
