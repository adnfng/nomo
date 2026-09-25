import { visit } from 'unist-util-visit';

type Node = { type: string; value?: string; url?: string; children?: Node[]; data?: { hName?: string; hProperties?: Record<string, unknown> } };

const YEAR = String.raw`(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+)?(?:19|20)\d{2}`;
const DATE = new RegExp(String.raw`^\s*(${YEAR}(?:\s*[–—-]\s*(?:${YEAR}|now|present|today))?)\s*·\s*`, 'i');
const NOTE = /\s+·\s+/;

function span(className: string, children: Node[]): Node {
  return { type: 'rowPart', children, data: { hName: 'span', hProperties: { className: [className] } } };
}

function addClass(node: Node, className: string) {
  node.data ??= {};
  const props = (node.data.hProperties ??= {});
  props.className = [...((props.className as string[] | undefined) ?? []), className];
}

function takeDate(children: Node[]) {
  const first = children[0];
  const match = first?.type === 'text' ? first.value?.match(DATE) : null;
  if (!first || !match) return { date: undefined, rest: children };
  const remainder = first.value!.slice(match[0].length);
  return { date: match[1], rest: remainder ? [{ ...first, value: remainder }, ...children.slice(1)] : children.slice(1) };
}

function splitAt(children: Node[], test: (node: Node) => RegExpMatchArray | null | boolean) {
  for (let index = 0; index < children.length; index++) {
    const node = children[index];
    const hit = test(node);
    if (!hit) continue;
    if (hit === true) return { head: children.slice(0, index), tail: children.slice(index + 1) };
    const [before, ...after] = node.value!.split(hit[0]);
    const head = [...children.slice(0, index), ...(before ? [{ ...node, value: before }] : [])];
    const tail = [...(after.length ? [{ ...node, value: after.join(hit[0]) }] : []), ...children.slice(index + 1)];
    return { head, tail };
  }
  return null;
}

function rowChildren(inline: Node[]) {
  const { date, rest } = takeDate(inline);
  const lines = splitAt(rest, node => node.type === 'break');
  const title = lines ? lines.head : rest;
  const note = splitAt(title, node => (node.type === 'text' ? node.value?.match(NOTE) ?? null : null));
  const body = note ? [...note.head, span('row-note', note.tail)] : title;
  const description = lines?.tail.length ? [span('row-description', lines.tail)] : [];
  return { dated: Boolean(date), noted: Boolean(note), children: [...(date ? [span('row-date', [{ type: 'text', value: date }])] : []), span('row-body', [...body, ...description])] };
}

function isText(node: Node | undefined, pattern: RegExp) {
  return node?.type === 'text' && pattern.test(node.value ?? '');
}

function isRowList(list: Node) {
  return list.children?.some(item => {
    const paragraph = item.children?.[0];
    if (paragraph?.type !== 'paragraph' || !paragraph.children) return false;
    return isText(paragraph.children[0], DATE) || paragraph.children.some(node => isText(node, NOTE));
  });
}

export function remarkRows() {
  return (tree: unknown) => {
    visit(tree as Node, 'list', (list: Node) => {
      if (!isRowList(list)) return;
      addClass(list, 'rows');
      for (const item of list.children ?? []) {
        const paragraph = item.children?.[0];
        if (paragraph?.type !== 'paragraph' || !paragraph.children) continue;
        const row = rowChildren(paragraph.children);
        addClass(item, row.dated ? 'row row--dated' : 'row');
        paragraph.children = row.children;
      }
    });
  };
}

const STAR_PATH = 'M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z';

function starIcon(): Node {
  return {
    type: 'star',
    data: {
      hName: 'svg',
      hProperties: { className: ['markdown-star'], role: 'img', ariaLabel: 'stars', viewBox: '0 0 24 24', width: 12, height: 12, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinejoin: 'round' },
      hChildren: [{ type: 'element', tagName: 'path', properties: { d: STAR_PATH }, children: [] }],
    } as Node['data'] & { hChildren: unknown[] },
  };
}

export function remarkStars() {
  return (tree: unknown) => {
    visit(tree as Node, 'text', (node: Node, index, parent: Node | undefined) => {
      if (!parent?.children || index === undefined || !node.value?.includes('★')) return;
      const parts = node.value.split('★').flatMap((text, i) => [...(i ? [starIcon()] : []), ...(text ? [{ type: 'text', value: text }] : [])]);
      parent.children.splice(index, 1, ...parts);
      return index + parts.length;
    });
  };
}

export function remarkExternalArrows() {
  return (tree: unknown) => {
    visit(tree as Node, 'link', (link: Node) => {
      if (/^https?:\/\//i.test(link.url ?? '')) addClass(link, 'markdown-link--arrow');
    });
  };
}
