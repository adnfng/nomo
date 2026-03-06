import { createElement, useEffect, type CSSProperties, type HTMLAttributes } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import { Link, useLocation } from "react-router-dom";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { parse as parseYaml } from "yaml";

type PageMap = Record<string, string>;
type ThemeName = "light" | "dark";

type ThemeDefinition = {
  name: string;
  semantic: Record<string, string>;
};

type BlockTag = keyof Pick<
  HTMLElementTagNameMap,
  "blockquote" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "hr" | "ol" | "p" | "pre" | "table" | "ul"
>;

type PageStyle = "standard" | "dense";

type PageFrontmatter = {
  theme: ThemeName;
  font: string;
  fontsize: string;
  style: PageStyle;
};

type PageRecord = {
  content: string;
  frontmatter: PageFrontmatter;
};

const DEFAULT_FRONTMATTER: PageFrontmatter = {
  theme: "light",
  font: "system",
  fontsize: "14.4px",
  style: "standard",
};

const SYSTEM_FONT_STACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
const THEME_URLS: Record<ThemeName, string> = {
  light: "/themes/light.json",
  dark: "/themes/dark.json",
};

const pageModules = import.meta.glob("/pages/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as PageMap;

const themeCache = new Map<ThemeName, Promise<ThemeDefinition>>();

function loadTheme(theme: ThemeName): Promise<ThemeDefinition> {
  const cached = themeCache.get(theme);
  if (cached) {
    return cached;
  }

  const promise = fetch(THEME_URLS[theme]).then(async (response) => {
    if (!response.ok) {
      throw new Error(`Failed to load ${theme} theme.`);
    }

    return (await response.json()) as ThemeDefinition;
  });

  themeCache.set(theme, promise);
  return promise;
}

function normalizeTheme(value: unknown): ThemeName {
  return value === "dark" ? "dark" : "light";
}

function normalizeFont(value: unknown): string {
  if (typeof value !== "string") {
    return DEFAULT_FRONTMATTER.font;
  }

  const trimmed = value.trim();
  return trimmed || DEFAULT_FRONTMATTER.font;
}

function normalizeFontSize(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `${value}px`;
  }

  if (typeof value !== "string") {
    return DEFAULT_FRONTMATTER.fontsize;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return DEFAULT_FRONTMATTER.fontsize;
  }

  return /^\d+(\.\d+)?$/.test(trimmed) ? `${trimmed}px` : trimmed;
}

function normalizeStyle(value: unknown): PageStyle {
  return value === "dense" ? "dense" : "standard";
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

      const lineGap =
        previousEndLine === null ? 0 : Math.max(child.position.start.line - previousEndLine - 1, 0);

      child.data ??= {};
      child.data.hProperties ??= {};
      child.data.hProperties["data-line-gap"] = String(lineGap);

      previousEndLine = child.position?.end?.line ?? child.position.start.line;
    }
  };
}

function extractFrontmatter(raw: string): PageRecord {
  const file = unified().use(remarkParse).use(remarkFrontmatter, ["yaml"]).parse(raw);

  let body = raw;
  let frontmatter: Record<string, unknown> = {};

  visit(file, "yaml", (node) => {
    if (Object.keys(frontmatter).length > 0) {
      return;
    }

    const parsed = parseYaml(node.value);
    if (parsed && typeof parsed === "object") {
      frontmatter = parsed as Record<string, unknown>;
    }

    const offset = node.position?.end?.offset;
    if (typeof offset === "number") {
      body = raw.slice(offset).replace(/^\s+/, "");
    }
  });

  return {
    content: body,
    frontmatter: {
      theme: normalizeTheme(frontmatter.theme),
      font: normalizeFont(frontmatter.font),
      fontsize: normalizeFontSize(
        frontmatter.fontsize ??
          frontmatter.fontSize ??
          frontmatter["font-size"] ??
          frontmatter["font size"],
      ),
      style: normalizeStyle(frontmatter.style),
    },
  };
}

function buildPages(modules: PageMap): Map<string, PageRecord> {
  const pages = new Map<string, PageRecord>();

  for (const [filePath, raw] of Object.entries(modules)) {
    const match = filePath.match(/\/([^/]+)\.md$/);
    const fileName = match?.[1]?.toLowerCase();
    if (!fileName) continue;
    pages.set(fileName, extractFrontmatter(raw));
  }

  return pages;
}

const pages = buildPages(pageModules);

function resolveSlug(pathname: string): string {
  const clean = pathname.replace(/^\/+|\/+$/g, "").toLowerCase();
  return clean || "home";
}

function getPageContent(pathname: string): { slug: string; page: PageRecord | null } {
  const slug = resolveSlug(pathname);
  const page = pages.get(slug) ?? null;
  return { slug, page };
}

function buildGoogleFontUrl(fontName: string): string {
  const family = fontName.trim().split(/\s+/).join("+");
  return `https://fonts.googleapis.com/css2?family=${family}:wght@400;500;600;700&display=swap`;
}

function applyFont(font: string) {
  const root = document.documentElement;
  const fontLinkId = "page-font-link";
  const existing = document.getElementById(fontLinkId);

  if (font.toLowerCase() === "system") {
    root.style.setProperty("--page-font-family", SYSTEM_FONT_STACK);
    existing?.remove();
    return;
  }

  root.style.setProperty("--page-font-family", `"${font}", ${SYSTEM_FONT_STACK}`);

  const link = existing instanceof HTMLLinkElement ? existing : document.createElement("link");
  link.id = fontLinkId;
  link.rel = "stylesheet";
  link.href = buildGoogleFontUrl(font);

  if (!existing) {
    document.head.append(link);
  }
}

function buildBlockStyle(
  properties: Record<string, unknown> | undefined,
  style: CSSProperties | undefined,
): CSSProperties | undefined {
  const gapValue = Number(properties?.["data-line-gap"]);
  if (!Number.isFinite(gapValue) || gapValue <= 0) {
    return style;
  }

  return {
    ...style,
    marginTop: `${gapValue}em`,
  };
}

function withBlockGap<T extends HTMLElement>(tagName: BlockTag) {
  return ({
    node,
    style,
    ...props
  }: HTMLAttributes<T> & {
    node?: { properties?: Record<string, unknown> };
  }) =>
    createElement(tagName, {
      ...props,
      style: buildBlockStyle(node?.properties, style),
    });
}

const markdownComponents: Components = {
  blockquote: withBlockGap("blockquote"),
  h1: withBlockGap("h1"),
  h2: withBlockGap("h2"),
  h3: withBlockGap("h3"),
  h4: withBlockGap("h4"),
  h5: withBlockGap("h5"),
  h6: withBlockGap("h6"),
  hr: withBlockGap("hr"),
  ol: withBlockGap("ol"),
  p: withBlockGap("p"),
  pre: withBlockGap("pre"),
  table: withBlockGap("table"),
  ul: withBlockGap("ul"),
};

function App() {
  const location = useLocation();
  const { slug, page } = getPageContent(location.pathname);

  useEffect(() => {
    if (!page) {
      return;
    }

    let cancelled = false;

    document.documentElement.style.setProperty("--page-font-size", page.frontmatter.fontsize);
    applyFont(page.frontmatter.font);

    loadTheme(page.frontmatter.theme)
      .then((theme) => {
        if (cancelled) {
          return;
        }

        document.documentElement.style.colorScheme = page.frontmatter.theme;

        for (const [key, value] of Object.entries(theme.semantic)) {
          document.documentElement.style.setProperty(`--${key}`, value);
        }
      })
      .catch((error: unknown) => {
        console.error(error);
      });

    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <main className="app-shell">
      <div className="page-wrap">
        <header className="page-header">
          <Link to="/" className="home-link">
            Nomo
          </Link>
        </header>

        <article className={`markdown style-${page?.frontmatter.style ?? DEFAULT_FRONTMATTER.style}`}>
          {page ? (
            <ReactMarkdown
              components={markdownComponents}
              remarkPlugins={[remarkFrontmatter, remarkBreaks, remarkGfm, remarkSourceSpacing]}
            >
              {page.content}
            </ReactMarkdown>
          ) : (
            <>
              <h1>Page Not Found</h1>
              <p>No markdown file exists for <code>{slug}</code>.</p>
              <p>Create <code>pages/{slug}.md</code> and refresh.</p>
              <p>
                <Link to="/">Back home</Link>
              </p>
            </>
          )}
        </article>
      </div>
    </main>
  );
}

export default App;
