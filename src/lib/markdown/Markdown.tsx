import ReactMarkdown from 'react-markdown';
import type { PageRecord } from '../content/types';
import { createMarkdownComponents } from './components';
import { markdownRemarkPlugins } from './plugins';

export function Markdown({ page, content = page.content }: { page: PageRecord; content?: string }) {
  const renderTimeline = (token: string) => {
    const body = page.timelines?.[token];
    if (body === undefined) return null;
    return <section className="markdown-timeline" aria-label="Timeline"><Markdown page={{ ...page, timelines: undefined }} content={body} /></section>;
  };
  return <ReactMarkdown components={createMarkdownComponents(page.galleries, page.assetBase, page.profileRoot, renderTimeline)} remarkPlugins={markdownRemarkPlugins}>{content}</ReactMarkdown>;
}
