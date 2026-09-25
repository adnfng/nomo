import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { absolute, profileImage } from '@/lib/content/identity';
import { summarize, plainText } from '@/lib/content/summary';
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
    return <div style={{ display: 'flex', gap: 14 }}>
      {Array.from(page.portfolio.balls).slice(0, 5).map((letter, index) => <div key={index} style={{ width: 104, height: 104, borderRadius: 52, background: BALL_PALETTE[index % BALL_PALETTE.length], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 50, height: 50, borderRadius: 25, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 500, color: '#0D0D0D' }}>{letter.toLowerCase()}</div>
      </div>)}
    </div>;
  }
  if (image) {
    const width = page.portfolio.avatarWidth ?? 100;
    const height = page.portfolio.avatarHeight ?? 140;
    const scale = 136 / Math.max(width, height);
    // eslint-disable-next-line jsx-a11y/alt-text -- next/og renders to an image; there is no accessibility tree
    return <img src={image} width={Math.round(width * scale)} height={Math.round(height * scale)} style={{ borderRadius: 14, objectFit: 'cover' }} />;
  }
  return <svg width="96" height="100" viewBox="0 0 275 288"><path d={NOMO_MARK_PATH} fill={TEXT} /></svg>;
}

function tabs(page: PageRecord) {
  return (page.sections ?? []).slice(0, 4).map(section => section.label);
}

export async function GET(request: Request, { params }: { params: Promise<{ user: string }> }) {
  const { user } = await params;
  const result = await getPage(`/${user}`).catch(() => null);
  if (!result?.page || result.status !== 'ready') return new Response('Not found', { status: 404 });
  const page = result.page;
  const [regular, medium] = await fonts;
  const image = await inlineImage(absolute(profileImage(page) ?? '', new URL(request.url).origin));
  const labels = tabs(page);
  const text = summarize(page.content, 190) || plainText(page.content).slice(0, 190);
  return new ImageResponse(
    <div style={{ width: 1200, height: 630, display: 'flex', flexDirection: 'column', background: '#ffffff', padding: '72px 96px', fontFamily: 'Geist', color: TEXT, letterSpacing: '-0.4px' }}>
      <Avatar page={page} image={image} />
      <div style={{ display: 'flex', gap: 30, marginTop: 32, fontSize: 36, fontWeight: 500 }}>
        {(labels.length ? labels : [user]).map((label, index) => <span key={label} style={{ color: index ? MUTED : TEXT }}>{label}</span>)}
      </div>
      <div style={{ display: 'flex', marginTop: 32, fontSize: 34, lineHeight: 1.4, maxWidth: 940, fontWeight: 400 }}>{text}</div>
      <div style={{ display: 'flex', flexGrow: 1 }} />
      <div style={{ display: 'flex', fontSize: 28, color: MUTED }}>nomo.md/{user.toLowerCase()}</div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [{ name: 'Geist', data: regular, weight: 400 }, { name: 'Geist', data: medium, weight: 500 }],
      headers: { 'Cache-Control': 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400' },
    },
  );
}
