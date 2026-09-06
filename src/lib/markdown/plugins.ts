import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import { visit } from "unist-util-visit";

function sourceGap(start: number, previous: number | null) {
  return previous === null ? 0 : Math.max(start - previous - 1, 0);
}

function setLineGap(node: { data?: { hProperties?: Record<string, string> } }, gap: number) {
  node.data ??= {};
  node.data.hProperties ??= {};
  node.data.hProperties['data-line-gap'] = String(gap);
}

function remarkSourceSpacing() {
  return (tree: {
    children?: Array<{
      type: string;
      position?: { start?: { line?: number }; end?: { line?: number } };
      data?: { hProperties?: Record<string, string> };
    }>;
  }) => {
    let previousEndLine: number | null = null;

    for (const child of tree.children ?? []) {
      if (typeof child.position?.start?.line !== "number") {
        continue;
      }

      const lineGap = sourceGap(child.position.start.line, previousEndLine);

      setLineGap(child, lineGap);

      previousEndLine = child.position?.end?.line ?? child.position.start.line;
    }
  };
}

function remarkLeadingImageBreak() {
  return (tree: {
    children?: Array<{
      type: string;
      children?: Array<{ type: string }>;
    }>;
  }) => {
    for (const child of tree.children ?? []) {
      if (child.type !== "paragraph" || !child.children || child.children.length < 2) {
        continue;
      }

      if (child.children[0].type === "image" && child.children[1].type === "break") {
        child.children.splice(1, 1);
      }
    }
  };
}

function createTextNode(value: string) {
  return { type: "text", value };
}

type InlineNode = { type: string; value?: string; children?: InlineNode[]; data?: Record<string, unknown> };

function markArrowLinks(nodes: InlineNode[]) {
  for (const node of nodes) {
    if (node.type === 'link') {
      node.data ??= {};
      const props = (node.data.hProperties ??= {}) as { className?: string[] };
      props.className = [...(props.className ?? []), 'markdown-link--arrow'];
    }
    if (node.children) markArrowLinks(node.children);
  }
}

function transformDelimited(children: InlineNode[], open: string, close: string, kind?: string, onClose?: (nodes: InlineNode[]) => void) {
  const output: InlineNode[] = [];
  const state: { collected: InlineNode[] | null } = { collected: null };
  const push = (node: InlineNode) => (state.collected ?? output).push(node);
  function consume(text: string) {
    let remaining = text;
    while (remaining) {
      const marker = state.collected ? close : open;
      const index = remaining.indexOf(marker);
      if (index < 0) { push(createTextNode(remaining)); return; }
      if (index > 0) push(createTextNode(remaining.slice(0, index)));
      if (state.collected) {
        onClose?.(state.collected);
        if (kind) output.push({ type: kind, children: state.collected, data: { hName: 'span', hProperties: { className: [`markdown-${kind}`] } } });
        else output.push(...state.collected);
        state.collected = null;
      } else {
        state.collected = [];
      }
      remaining = remaining.slice(index + marker.length);
    }
  }
  for (const child of children) {
    if (child.type === 'text' && typeof child.value === 'string') consume(child.value);
    else push(child);
  }
  if (state.collected) output.push(createTextNode(open), ...state.collected);
  return output;
}

function delimiterPlugin(open: string, close: string, kind?: string, skip: string[] = [], onClose?: (nodes: InlineNode[]) => void) {
  return () => (tree: unknown) => {
    visit(tree as InlineNode, (node: InlineNode) => {
      if (!node.children || skip.includes(node.type)) return;
      node.children = transformDelimited(node.children, open, close, kind, onClose);
    });
  };
}
const remarkArrows = delimiterPlugin('((', '))', undefined, ['muted', 'small'], markArrowLinks);
const remarkSmall = delimiterPlugin('::', '::', 'small', ['small']);
const remarkMuted = delimiterPlugin('{{', '}}', 'muted', ['muted']);

export const markdownRemarkPlugins = [
  remarkFrontmatter,
  remarkBreaks,
  remarkGfm,
  remarkArrows,
  remarkSmall,
  remarkMuted,
  remarkLeadingImageBreak,
  remarkSourceSpacing,
];
