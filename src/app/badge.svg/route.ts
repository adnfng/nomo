import { badge } from '@/lib/badge';
import { matchRoute } from '@/lib/content/routes';

export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const route = matchRoute(`/${params.get('user') ?? ''}`);
  const label = route.type === 'profile-root' ? `nomo.md/${route.username.toLowerCase()}` : 'nomo.md';
  const theme = params.get('theme') === 'light' ? 'light' : 'dark';
  return new Response(badge(label, theme), {
    headers: { 'Content-Type': 'image/svg+xml; charset=utf-8', 'Cache-Control': 'public, max-age=86400, s-maxage=604800' },
  });
}
