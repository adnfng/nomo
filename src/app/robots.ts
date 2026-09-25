import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/content/identity';

const PRIVATE = ['/analytics', '/api/hit', '/api/cron/', '/api/claim', '/api/draft/', '/api/preview/'];
const AI_AGENTS = ['OAI-SearchBot', 'ChatGPT-User', 'GPTBot', 'Claude-SearchBot', 'Claude-User', 'ClaudeBot', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'DuckAssistBot', 'MistralAI-User', 'Amazonbot', 'meta-externalagent', 'CCBot'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE },
      { userAgent: AI_AGENTS, allow: '/', disallow: PRIVATE },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
