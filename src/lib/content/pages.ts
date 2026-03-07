import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { parse as parseYaml } from "yaml";

import {
  DEFAULT_FRONTMATTER,
  type GalleryMap,
  type PageFrontmatter,
  type PageRecord,
  type ThemeName,
} from "./types";

type PageMap = Record<string, string>;

const GALLERY_BLOCK_PATTERN = /\[\[gallery\]\]\s*([\s\S]*?)\s*\[\[\/gallery\]\]/g;

const pageModules = import.meta.glob("/pages/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as PageMap;

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

function parseFrontmatter(frontmatter: Record<string, unknown>): PageFrontmatter {
  return {
    theme: normalizeTheme(frontmatter.theme),
    font: normalizeFont(frontmatter.font),
    fontsize: normalizeFontSize(
      frontmatter.fontsize ??
        frontmatter.fontSize ??
        frontmatter["font-size"] ??
        frontmatter["font size"],
    ),
  };
}

function extractGalleryBlocks(content: string): { content: string; galleries: GalleryMap } {
  const galleries: GalleryMap = {};
  let galleryIndex = 0;

  const nextContent = content.replace(GALLERY_BLOCK_PATTERN, (_, body: string) => {
    const items = body
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.match(/^!\[[^\]]*]\((.+?)\)$/)?.[1] ?? line);

    if (items.length === 0) {
      return "";
    }

    const token = `@@GALLERY:${galleryIndex}@@`;
    galleries[token] = items;
    galleryIndex += 1;

    return `\n\n${token}\n\n`;
  });

  return {
    content: nextContent,
    galleries,
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

  const { content, galleries } = extractGalleryBlocks(body);

  return {
    content,
    frontmatter: parseFrontmatter(frontmatter),
    galleries,
  };
}

function buildPages(modules: PageMap): Map<string, PageRecord> {
  const pages = new Map<string, PageRecord>();

  for (const [filePath, raw] of Object.entries(modules)) {
    const match = filePath.match(/\/([^/]+)\.md$/);
    const fileName = match?.[1]?.toLowerCase();
    if (!fileName) {
      continue;
    }

    pages.set(fileName, extractFrontmatter(raw));
  }

  return pages;
}

const pages = buildPages(pageModules);

export function resolveSlug(pathname: string): string {
  const clean = pathname.replace(/^\/+|\/+$/g, "").toLowerCase();
  return clean || "home";
}

export function getPageContent(pathname: string): { slug: string; page: PageRecord | null } {
  const slug = resolveSlug(pathname);
  return {
    slug,
    page: pages.get(slug) ?? null,
  };
}
