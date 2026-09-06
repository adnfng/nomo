import { Children, isValidElement, type ReactNode } from 'react';
import { CopyButton } from './CopyButton';

const COMMANDS = new Set(['npx', 'git', 'gh', 'cd', 'bun', 'npm']);

function shellClass(token: string) {
  if (COMMANDS.has(token)) return 'syntax-pink';
  if (token.startsWith('-')) return 'syntax-blue';
  if (token.includes('/') || token.startsWith('.') || token === 'degit') return 'syntax-green';
}

function highlightShell(text: string) {
  return text.split(/(\s+)/).map((token, index) => {
    const className = shellClass(token);
    return className ? <span key={index} className={className}>{token}</span> : token;
  });
}

function jsonClass(token: string, rest: string) {
  if (token === 'true' || token === 'false' || token === 'null') return 'syntax-pink';
  return /^\s*:/.test(rest) ? 'syntax-blue' : 'syntax-green';
}

function highlightJson(text: string) {
  const pattern = /"(?:\\.|[^"\\])*"(?=\s*:)|"(?:\\.|[^"\\])*"|\b(?:true|false|null)\b/g;
  const tokens: ReactNode[] = [];
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > cursor) tokens.push(text.slice(cursor, match.index));
    tokens.push(<span key={match.index} className={jsonClass(match[0], text.slice(match.index + match[0].length))}>{match[0]}</span>);
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) tokens.push(text.slice(cursor));
  return tokens;
}

function highlightYaml(text: string) {
  return text.split('\n').flatMap((line, index) => {
    const prefix = index ? '\n' : '';
    const match = /^( *)([^:#\s][^:]*)(:)( *)(.*)$/.exec(line);
    if (!match) return [prefix + line];
    return [prefix, match[1], <span key={`${index}-k`} className="syntax-blue">{match[2]}</span>, match[3], match[4], match[5] ? <span key={`${index}-v`} className="syntax-green">{match[5]}</span> : ''];
  });
}

function paint(className: string, value: string, key: string) {
  return <span key={key} className={className}>{value}</span>;
}

function markdownInlineClass(token: string) {
  if (token.startsWith('![')) return 'syntax-green';
  if (token.startsWith('[')) return 'syntax-blue';
  if (token.startsWith('{{') || token.startsWith('[[')) return 'syntax-pink';
  return 'syntax-green';
}

function highlightMarkdownInline(line: string, key: number) {
  const pattern = /!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]+\)|\{\{[^}]+\}\}|`[^`]+`/g;
  const tokens: ReactNode[] = [];
  let cursor = 0;
  for (const match of line.matchAll(pattern)) {
    if (match.index > cursor) tokens.push(line.slice(cursor, match.index));
    tokens.push(paint(markdownInlineClass(match[0]), match[0], `${key}-${match.index}`));
    cursor = match.index + match[0].length;
  }
  if (cursor < line.length) tokens.push(line.slice(cursor));
  return tokens;
}

function highlightMarkdownLine(line: string, key: number) {
  if (/^(#{1,6} |===== )/.test(line) || line.startsWith('[[')) return [paint('syntax-pink', line, `${key}-h`)];
  if (/^(https?:\/\/|\/|\.\/)/.test(line)) return [paint('syntax-green', line, `${key}-p`)];
  return highlightMarkdownInline(line, key);
}

function highlightMarkdown(text: string) {
  return text.split('\n').flatMap((line, index) => {
    const nodes = highlightMarkdownLine(line, index);
    return index ? ['\n', ...nodes] : nodes;
  });
}

function highlightUrls(text: string) {
  const pattern = /https?:\/\/[^\s]+/g;
  const tokens: ReactNode[] = [];
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > cursor) tokens.push(text.slice(cursor, match.index));
    tokens.push(paint('syntax-blue', match[0], String(match.index)));
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) tokens.push(text.slice(cursor));
  return tokens.length ? tokens : text;
}

function highlight(language: string | undefined, text: string) {
  if (language === 'bash' || language === 'shell' || language === 'sh' || language === 'zsh') return highlightShell(text);
  if (language === 'json') return highlightJson(text);
  if (language === 'yaml' || language === 'yml') return highlightYaml(text);
  if (language === 'md' || language === 'markdown') return highlightMarkdown(text);
  return highlightUrls(text);
}

function isShell(language?: string) {
  return language === 'bash' || language === 'shell' || language === 'sh' || language === 'zsh';
}

export function CodeBlock({ language, text }: { language?: string; text: string }) {
  return <div className="code-block">
    <pre>
      <code className={language ? `language-${language}` : undefined}>
        {isShell(language) ? <span className="command-prompt">$ </span> : null}
        {highlight(language, text)}
      </code>
    </pre>
    <CopyButton text={text} />
  </div>;
}

function textOf(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  return isValidElement<{ children?: ReactNode }>(node) ? textOf(node.props.children) : '';
}

export function MarkdownPre({ children }: { children?: ReactNode }) {
  const child = Children.toArray(children).find(node => isValidElement<{ className?: string; children?: ReactNode }>(node));
  const code = isValidElement<{ className?: string; children?: ReactNode }>(child) ? child : undefined;
  const language = code?.props.className?.match(/language-([\w-]+)/)?.[1];
  return <CodeBlock language={language} text={textOf(code?.props.children ?? children).replace(/\n$/, '')} />;
}
