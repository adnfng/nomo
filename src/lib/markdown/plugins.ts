import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import { visit } from "unist-util-visit";

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

      const lineGap =
        previousEndLine === null ? 0 : Math.max(child.position.start.line - previousEndLine - 1, 0);

      child.data ??= {};
      child.data.hProperties ??= {};
      child.data.hProperties["data-line-gap"] = String(lineGap);

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

function createBadgeNode(children: Array<Record<string, unknown>>) {
  return {
    type: "badge",
    children,
    data: {
      hName: "span",
      hProperties: {
        className: ["markdown-badge"],
      },
    },
  };
}

function transformBadgeChildren(children: Array<Record<string, unknown>>) {
  const output: Array<Record<string, unknown>> = [];
  let isCollectingBadge = false;
  let badgeChildren: Array<Record<string, unknown>> = [];

  const flushBadgeAsText = () => {
    output.push(createTextNode("(("));
    output.push(...badgeChildren);
    badgeChildren = [];
    isCollectingBadge = false;
  };

  const pushNode = (node: Record<string, unknown>) => {
    if (isCollectingBadge) {
      badgeChildren.push(node);
      return;
    }

    output.push(node);
  };

  for (const child of children) {
    if (child.type !== "text" || typeof child.value !== "string") {
      pushNode(child);
      continue;
    }

    let remaining = child.value;

    while (remaining.length > 0) {
      if (!isCollectingBadge) {
        const startIndex = remaining.indexOf("((");
        if (startIndex === -1) {
          pushNode(createTextNode(remaining));
          remaining = "";
          continue;
        }

        if (startIndex > 0) {
          output.push(createTextNode(remaining.slice(0, startIndex)));
        }

        isCollectingBadge = true;
        badgeChildren = [];
        remaining = remaining.slice(startIndex + 2);
        continue;
      }

      const endIndex = remaining.indexOf("))");
      if (endIndex === -1) {
        badgeChildren.push(createTextNode(remaining));
        remaining = "";
        continue;
      }

      if (endIndex > 0) {
        badgeChildren.push(createTextNode(remaining.slice(0, endIndex)));
      }

      output.push(createBadgeNode(badgeChildren));
      badgeChildren = [];
      isCollectingBadge = false;
      remaining = remaining.slice(endIndex + 2);
    }
  }

  if (isCollectingBadge) {
    flushBadgeAsText();
  }

  return output;
}

function remarkBadges() {
  return (tree: unknown) => {
    visit(
      tree as { type: string; children?: Array<Record<string, unknown>> },
      (node: unknown) =>
        typeof node === "object" &&
        node !== null &&
        "children" in node &&
        Array.isArray((node as { children?: unknown }).children),
      (node: unknown) => {
        const parent = node as { type?: string; children?: Array<Record<string, unknown>> };

        if (!Array.isArray(parent.children) || parent.type === "badge") {
          return;
        }

        parent.children = transformBadgeChildren(parent.children);
      },
    );
  };
}

export const markdownRemarkPlugins = [
  remarkFrontmatter,
  remarkBreaks,
  remarkGfm,
  remarkBadges,
  remarkLeadingImageBreak,
  remarkSourceSpacing,
];
