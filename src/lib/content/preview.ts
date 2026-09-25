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
  repos: { name: string; description: string | null; url: string }[];
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

export function previewMarkdown(profile: GitHubProfile) {
  const name = escapeMarkdown(profile.name || profile.login);
  const about = [profile.company, profile.location].filter(Boolean).map(value => escapeMarkdown(String(value).replace(/^@/, ''))).join(' · ');
  const repos = profile.repos.slice(0, 4).map(repo => `- [${escapeMarkdown(repo.name)}](${encodeURI(repo.url)})${repo.description ? ` {{${escapeMarkdown(repo.description)}}}` : ''}`);
  return [
    `![image:88x88](${profile.avatarUrl})`,
    `===== ${name} =====`,
    `{{@${profile.login} doesn’t have a page yet. This is a preview.}} (([Make it yours](${claimHref(profile.login)})))`,
    profile.bio ? escapeMarkdown(profile.bio) : '',
    about,
    links(profile),
    repos.length ? `#### Projects\n\n${repos.join('\n')}` : '',
  ].filter(Boolean).join('\n\n');
}

export function claimMarkdown(profile: GitHubProfile) {
  return `${previewMarkdown(profile)
    .replace(/^!\[image:88x88\]\([^)]*\)/, '![image:88x88](/assets/me.jpg)')
    .replace(/\n\n\{\{@[^\n]*doesn’t have a page yet[^\n]*/, '')}\n`;
}

export function blocks(source: string) {
  const found: Record<string, string> = {};
  for (const part of source.split(/^%% /m).slice(1)) {
    const [name, ...lines] = part.split('\n');
    found[name.trim()] = lines.join('\n').trim();
  }
  return found;
}

export function fill(markdown: string, values: Record<string, string>) {
  return markdown.replace(/%(\w+)%/g, (match, key: string) => values[key] ?? match);
}

export function brokenRepoMarkdown(login: string) {
  return [
    `{{@${login} has a \`.nomo\` repo, but there’s no \`human.md\` in it yet.}}`,
    `Add a \`human.md\` file at the top of [github.com/${login}/.nomo](https://github.com/${login}/.nomo) on the \`main\` branch. This page shows up within a minute.`,
    '(([How to write it](/docs)))',
  ].join('\n\n');
}
