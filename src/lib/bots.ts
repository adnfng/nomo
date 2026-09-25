export type BotKind = 'training' | 'search' | 'user' | 'search-engine' | 'preview';
export type Bot = { name: string; company: string; kind: BotKind; pattern: RegExp };

// Seeded from github.com/ai-robots-txt/ai.robots.txt. Order matters: the first match wins.
export const BOTS: Bot[] = [
  { name: 'OAI-SearchBot', company: 'OpenAI', kind: 'search', pattern: /OAI-SearchBot/i },
  { name: 'ChatGPT-User', company: 'OpenAI', kind: 'user', pattern: /ChatGPT-User/i },
  { name: 'GPTBot', company: 'OpenAI', kind: 'training', pattern: /GPTBot/i },
  { name: 'Claude-SearchBot', company: 'Anthropic', kind: 'search', pattern: /Claude-SearchBot/i },
  { name: 'Claude-User', company: 'Anthropic', kind: 'user', pattern: /Claude-User/i },
  { name: 'ClaudeBot', company: 'Anthropic', kind: 'training', pattern: /ClaudeBot|anthropic-ai/i },
  { name: 'Perplexity-User', company: 'Perplexity', kind: 'user', pattern: /Perplexity-User/i },
  { name: 'PerplexityBot', company: 'Perplexity', kind: 'search', pattern: /PerplexityBot/i },
  { name: 'Google-Extended', company: 'Google', kind: 'training', pattern: /Google-Extended/i },
  { name: 'Gemini', company: 'Google', kind: 'user', pattern: /Google-Gemini|Gemini-Deep-Research/i },
  { name: 'Googlebot', company: 'Google', kind: 'search-engine', pattern: /Googlebot/i },
  { name: 'Bingbot', company: 'Microsoft', kind: 'search-engine', pattern: /bingbot/i },
  { name: 'DuckAssistBot', company: 'DuckDuckGo', kind: 'user', pattern: /DuckAssistBot/i },
  { name: 'DuckDuckBot', company: 'DuckDuckGo', kind: 'search-engine', pattern: /DuckDuckBot/i },
  { name: 'Applebot', company: 'Apple', kind: 'search-engine', pattern: /Applebot/i },
  { name: 'Meta', company: 'Meta', kind: 'training', pattern: /meta-externalagent|meta-externalfetcher|FacebookBot/i },
  { name: 'Amazonbot', company: 'Amazon', kind: 'training', pattern: /Amazonbot/i },
  { name: 'Bytespider', company: 'ByteDance', kind: 'training', pattern: /Bytespider/i },
  { name: 'CCBot', company: 'Common Crawl', kind: 'training', pattern: /CCBot/i },
  { name: 'MistralAI-User', company: 'Mistral', kind: 'user', pattern: /MistralAI-User/i },
  { name: 'cohere-ai', company: 'Cohere', kind: 'training', pattern: /cohere-ai|cohere-training/i },
  { name: 'YouBot', company: 'You.com', kind: 'search', pattern: /YouBot/i },
  { name: 'Brave', company: 'Brave', kind: 'search-engine', pattern: /Bravebot/i },
  { name: 'Link preview', company: 'Social', kind: 'preview', pattern: /facebookexternalhit|Twitterbot|Slackbot|Discordbot|LinkedInBot|WhatsApp|TelegramBot|redditbot|iMessage/i },
];

export const AI_KINDS: BotKind[] = ['training', 'search', 'user'];

export function classifyBot(userAgent: string | null | undefined): Bot | undefined {
  if (!userAgent) return undefined;
  return BOTS.find(bot => bot.pattern.test(userAgent));
}

// Next streams metadata and content to browsers. Anything that can't run JavaScript gets one complete document instead.
const NEXT_DEFAULT = String.raw`[\w-]+-Google|Google-[\w-]+|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight`;
const EXTRA = String.raw`bot|crawl|spider|GPT|ChatGPT|Claude|anthropic|Perplexity|cohere|Mistral|Gemini|curl|wget|python|httpx|axios|node-fetch|undici|Go-http-client|okhttp|Java\/|Ruby|PHP|iMessage|Telegram`;
export const HTML_LIMITED_BOTS = new RegExp(`${NEXT_DEFAULT}|${EXTRA}`, 'i');
