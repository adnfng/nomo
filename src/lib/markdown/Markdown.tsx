import ReactMarkdown from 'react-markdown';
import type { PageRecord } from '../content/types';
import { createMarkdownComponents } from './components';
import { markdownRemarkPlugins, sectionsRemarkPlugins } from './plugins';

export function Markdown({ page, content = page.content }: { page: PageRecord; content?: string }) {
  const sections = page.layout === 'sections';
  return <ReactMarkdown components={createMarkdownComponents(page.galleries, page.assetBase, page.profileRoot, sections)} remarkPlugins={sections ? sectionsRemarkPlugins : markdownRemarkPlugins}>{content}</ReactMarkdown>;
}
