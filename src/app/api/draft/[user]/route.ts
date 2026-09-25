import { claimMarkdown } from '@/lib/content/preview';
import { matchRoute } from '@/lib/content/routes';
import { lookupGitHub } from '@/lib/server/github';

export async function GET(_request: Request, { params }: { params: Promise<{ user: string }> }) {
  const route = matchRoute(`/${(await params).user}`);
  if (route.type !== 'profile-root') return new Response('Not a GitHub username\n', { status: 400 });
  const lookup = await lookupGitHub(route.username);
  if (lookup.status === 'none') return new Response('No such GitHub user\n', { status: 404 });
  if (lookup.status !== 'found') return new Response('GitHub is not answering right now\n', { status: 503 });
  return new Response(claimMarkdown(lookup.profile), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Cache-Control': 'public, max-age=300, s-maxage=3600', 'X-Robots-Tag': 'noindex' },
  });
}
