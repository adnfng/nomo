import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { absolute, profileImage } from '@/lib/content/identity';
import { plainText, profileName, summarize } from '@/lib/content/summary';
import type { PageRecord } from '@/lib/content/types';
import { getPage } from '@/lib/server/page-data';
import { BADGE_MARK, BADGE_THEMES, badgeWidth } from '@/lib/badge';
import { BALL_PALETTE } from '@/lib/theme/nomoMark';

const FONTS = join(process.cwd(), 'node_modules/geist/dist/fonts/geist-sans');
const fonts = Promise.all([readFile(join(FONTS, 'Geist-Regular.ttf')), readFile(join(FONTS, 'Geist-Medium.ttf')), readFile(join(FONTS, 'Geist-SemiBold.ttf'))]);

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

const AVATAR = 112;

function Avatar({ page, image }: { page: PageRecord; image?: string }) {
  if (page.portfolio.balls) {
    return <div style={{ display: 'flex', gap: 6 }}>
      {Array.from(page.portfolio.balls).slice(0, 5).map((letter, index) => <div key={index} style={{ width: 56, height: 56, borderRadius: 28, background: BALL_PALETTE[index % BALL_PALETTE.length], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 26, height: 26, borderRadius: 13, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 500, color: '#0D0D0D' }}>{letter.toLowerCase()}</div>
      </div>)}
    </div>;
  }
  if (!image) return null;
  // eslint-disable-next-line jsx-a11y/alt-text -- next/og renders to an image; there is no accessibility tree
  return <img src={image} width={AVATAR} height={AVATAR} style={{ borderRadius: 12, objectFit: 'cover' }} />;
}

const BADGE_SCALE = 2;

function Badge({ label }: { label: string }) {
  const colors = BADGE_THEMES.dark;
  const x = BADGE_SCALE;
  return <div style={{ display: 'flex', alignItems: 'center', height: 20 * x, width: badgeWidth(label) * x, paddingLeft: 8 * x, borderRadius: 4 * x, background: colors.background, color: colors.text, fontSize: 11 * x, fontWeight: 400, letterSpacing: `${-0.1 * x}px` }}>
    <svg width={12 * x} height={13 * x} viewBox="0 0 150 160" style={{ marginRight: 7 * x }}>{BADGE_MARK.map(([d, fill]) => <path key={d.slice(0, 16)} d={d} fill={fill} />)}</svg>
    {label}
  </div>;
}

export async function GET(request: Request, { params }: { params: Promise<{ user: string }> }) {
  const { user } = await params;
  const result = await getPage(`/${user}`).catch(() => null);
  if (!result?.page || result.status !== 'ready') return new Response('Not found', { status: 404 });
  const page = result.page;
  const [regular, medium, semibold] = await fonts;
  const image = await inlineImage(absolute(profileImage(page) ?? '', new URL(request.url).origin));
  const name = profileName(page, user);
  const text = summarize(page.content, 110) || plainText(page.content).slice(0, 110);
  return new ImageResponse(
    <div style={{ width: 1200, height: 630, display: 'flex', flexDirection: 'column', background: '#ffffff', padding: 32, fontFamily: 'Geist', color: TEXT }}>
      <div style={{ display: 'flex' }}>
        <Badge label={`nomo.md/${user.toLowerCase()}`} />
      </div>
      <div style={{ display: 'flex', flexGrow: 1 }} />
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 28 }}>
        <Avatar page={page} image={image} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, maxWidth: 900 }}>
          <div style={{ display: 'flex', fontSize: 32, fontWeight: 600, lineHeight: 1.25, letterSpacing: '-0.43px', textWrap: 'balance' }}>{name}</div>
          {text ? <div style={{ fontSize: 24, fontWeight: 400, lineHeight: 1.4, letterSpacing: '-0.43px', color: MUTED, textWrap: 'balance' }}>{text}</div> : null}
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [{ name: 'Geist', data: regular, weight: 400 }, { name: 'Geist', data: medium, weight: 500 }, { name: 'Geist', data: semibold, weight: 600 }],
      headers: { 'Cache-Control': 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400' },
    },
  );
}
