import { claimMarkdown, withoutPhoto, type GitHubProfile } from '../content/preview';

export const TEMPLATE = { owner: 'adnfng', repo: '.nomo' };
export const CLAIM_COOKIE = 'nomo_claim';

type Options = { token: string; fetcher?: typeof fetch; wait?: (ms: number) => Promise<void> };
export type ClaimResult = { status: 'created' | 'existing'; login: string } | { status: 'mismatch'; login: string } | { status: 'failed'; login?: string; reason: string };

function client({ token, fetcher = fetch }: Options) {
  return (path: string, init: RequestInit = {}) => fetcher(`https://api.github.com${path}`, {
    ...init,
    headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'nomo.md', ...init.headers },
    signal: AbortSignal.timeout(10_000),
  });
}

async function fileSha(api: ReturnType<typeof client>, login: string, path: string) {
  const response = await api(`/repos/${login}/.nomo/contents/${path}`);
  return response.ok ? String((await response.json() as { sha: string }).sha) : undefined;
}

async function waitForRepo(api: ReturnType<typeof client>, login: string, wait: (ms: number) => Promise<void>) {
  for (let attempt = 0; attempt < 8; attempt++) {
    const sha = await fileSha(api, login, 'human.md');
    if (sha) return sha;
    await wait(750);
  }
  return undefined;
}

async function putFile(api: ReturnType<typeof client>, login: string, path: string, content: Buffer, message: string, sha?: string) {
  const response = await api(`/repos/${login}/.nomo/contents/${path}`, { method: 'PUT', body: JSON.stringify({ message, content: content.toString('base64'), ...(sha ? { sha } : {}) }) });
  if (!response.ok) throw new Error(`Could not write ${path} (${response.status})`);
}

async function avatar(fetcher: typeof fetch, url: string) {
  try {
    const response = await fetcher(`${url}${url.includes('?') ? '&' : '?'}s=400`, { signal: AbortSignal.timeout(5_000) });
    return response.ok ? Buffer.from(await response.arrayBuffer()) : undefined;
  } catch {
    return undefined;
  }
}

async function writeDraft(api: ReturnType<typeof client>, login: string, profile: GitHubProfile, fetcher: typeof fetch, sha?: string) {
  const photo = await avatar(fetcher, profile.avatarUrl);
  if (photo) await putFile(api, login, 'assets/me.jpg', photo, 'Use my GitHub photo', await fileSha(api, login, 'assets/me.jpg'));
  const markdown = claimMarkdown(profile);
  await putFile(api, login, 'human.md', Buffer.from(photo ? markdown : withoutPhoto(markdown)), 'Start my page from my GitHub profile', sha);
}

async function signedInAs(api: ReturnType<typeof client>) {
  const me = await api('/user');
  return me.ok ? String((await me.json() as { login: string }).login) : undefined;
}

export async function claimPage(expected: string, profile: GitHubProfile | null, options: Options): Promise<ClaimResult> {
  const api = client(options);
  const login = await signedInAs(api);
  if (!login) return { status: 'failed', reason: 'GitHub didn’t accept the sign-in.' };
  if (login.toLowerCase() !== expected.toLowerCase()) return { status: 'mismatch', login };
  if ((await api(`/repos/${login}/.nomo`)).ok) return { status: 'existing', login };
  const created = await api(`/repos/${TEMPLATE.owner}/${TEMPLATE.repo}/generate`, { method: 'POST', body: JSON.stringify({ owner: login, name: '.nomo', private: false, description: `My page on Nomo: https://nomo.md/${login.toLowerCase()}` }) });
  if (!created.ok) return { status: 'failed', login, reason: `GitHub couldn’t create the repo (${created.status}).` };
  const sha = await waitForRepo(api, login, options.wait ?? (ms => new Promise(resolve => setTimeout(resolve, ms))));
  if (!profile) return { status: 'created', login };
  try {
    await writeDraft(api, login, profile, options.fetcher ?? fetch, sha);
  } catch (error) {
    return { status: 'failed', login, reason: error instanceof Error ? error.message : 'Could not write the first draft.' };
  }
  return { status: 'created', login };
}
