import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { absolute, profileImage } from '@/lib/content/identity';
import { plainText, profileName, summarize } from '@/lib/content/summary';
import type { PageRecord } from '@/lib/content/types';
import { getPage } from '@/lib/server/page-data';
import { BALL_PALETTE, NOMO_MARK_PATH } from '@/lib/theme/nomoMark';

const FONTS = join(process.cwd(), 'node_modules/geist/dist/fonts/geist-sans');
const fonts = Promise.all([readFile(join(FONTS, 'Geist-Regular.ttf')), readFile(join(FONTS, 'Geist-Medium.ttf'))]);

const TEXT = '#111111';
const MUTED = '#888888';

async function inlineImage(url: string | undefined) {
  if (!url) return undefined;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(3_000) });
    const type = response.headers.get('content-type') ?? '';
    if (!response.ok || !/^image\/(png|jpe?g|gif)/.test(type)) return undefined;
    return `data:${type};base64,${Buffer.from(await response.arrayBuffer()).toString('base64')}`;
  } catch {
    return undefined;
  }
}

function Avatar({ page, image }: { page: PageRecord; image?: string }) {
  if (page.portfolio.balls) {
    return <div style={{ display: 'flex', gap: 8 }}>
      {Array.from(page.portfolio.balls).slice(0, 5).map((letter, index) => <div key={index} style={{ width: 72, height: 72, borderRadius: 36, background: BALL_PALETTE[index % BALL_PALETTE.length], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 34, height: 34, borderRadius: 17, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 500, color: '#0D0D0D' }}>{letter.toLowerCase()}</div>
      </div>)}
    </div>;
  }
  if (!image) return null;
  const width = page.portfolio.avatarWidth ?? 100;
  const height = page.portfolio.avatarHeight ?? 140;
  const scale = 112 / Math.max(width, height);
  // eslint-disable-next-line jsx-a11y/alt-text -- next/og renders to an image; there is no accessibility tree
  return <img src={image} width={Math.round(width * scale)} height={Math.round(height * scale)} style={{ borderRadius: 12, objectFit: 'cover' }} />;
}

export async function GET(request: Request, { params }: { params: Promise<{ user: string }> }) {
  const { user } = await params;
  const result = await getPage(`/${user}`).catch(() => null);
  if (!result?.page || result.status !== 'ready') return new Response('Not found', { status: 404 });
  const page = result.page;
  const [regular, medium] = await fonts;
  const image = await inlineImage(absolute(profileImage(page) ?? '', new URL(request.url).origin));
  const name = profileName(page, user);
  const text = summarize(page.content, 110) || plainText(page.content).slice(0, 110);
  return new ImageResponse(
    <div style={{ width: 1200, height: 630, display: 'flex', flexDirection: 'column', background: '#ffffff', padding: 72, fontFamily: 'Geist', color: TEXT, letterSpacing: '-0.3px' }}>
      <svg width="34" height="36" viewBox="0 0 275 288"><path d={NOMO_MARK_PATH} fill={TEXT} /></svg>
      <div style={{ display: 'flex', flexGrow: 1 }} />
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 48 }}>
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 760 }}>
          <Avatar page={page} image={image} />
          <div style={{ display: 'flex', marginTop: 28, fontSize: 44, fontWeight: 500, lineHeight: 1.15 }}>{name}</div>
          {text ? <div style={{ display: 'flex', marginTop: 12, fontSize: 28, lineHeight: 1.4, color: MUTED }}>{text}</div> : null}
        </div>
        <div style={{ display: 'flex', fontSize: 26, color: MUTED, whiteSpace: 'nowrap' }}>nomo.md/{user.toLowerCase()}</div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [{ name: 'Geist', data: regular, weight: 400 }, { name: 'Geist', data: medium, weight: 500 }],
      headers: { 'Cache-Control': 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400' },
    },
  );
}
