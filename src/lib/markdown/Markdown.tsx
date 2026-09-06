import ReactMarkdown from 'react-markdown';
import type { PageRecord } from '../content/types';
import { createMarkdownComponents } from './components';
import { markdownRemarkPlugins } from './plugins';

export function Markdown({ page, content = page.content }: { page: PageRecord; content?: string }) {
  return <ReactMarkdown components={createMarkdownComponents(page.galleries, page.assetBase, page.profileRoot)} remarkPlugins={markdownRemarkPlugins}>{content}</ReactMarkdown>;
}
