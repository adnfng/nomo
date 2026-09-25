import type { NextConfig } from 'next';
import { HTML_LIMITED_BOTS } from './src/lib/bots';

const config: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  cacheLife: { profile: { stale: 30, revalidate: 60, expire: 86_400 } },
  htmlLimitedBots: HTML_LIMITED_BOTS,
  outputFileTracingIncludes: {
    '/**': ['./site/**/*.md', './adnfng/**/*.md'],
    '/api/og/[user]': ['./node_modules/geist/dist/fonts/geist-sans/Geist-Regular.ttf', './node_modules/geist/dist/fonts/geist-sans/Geist-Medium.ttf'],
  },
  poweredByHeader: false,
  async headers() {
    return [{ source: '/nomo.glb', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }] }];
  },
  serverExternalPackages: ['@electric-sql/pglite'],
};

export default config;
