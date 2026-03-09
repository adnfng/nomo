import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { parse as parseYaml } from "yaml";

import { buildGitHubRawBase, buildGitHubRawUrl, resolveAssetUrl } from "./paths";
import {
  DEFAULT_FRONTMATTER,
  type GalleryDefinition,
  type GalleryMap,
  type PageAlign,
  type PageFrontmatter,
  type PageRecord,
  type ThemeName,
} from "./types";

type NativeSlug = "404" | "docs" | "home";
type PageMap = Record<string, string>;
type RouteMatch =
  | { slug: NativeSlug; type: "native" }
  | { slug: string; type: "profile-content"; username: string; contentPath: string }
  | { slug: string; type: "profile-root"; username: string }
  | { slug: "404"; type: "not-found" };

const GITHUB_BRANCHES = ["main", "master"] as const;
const NATIVE_SLUGS = new Set<NativeSlug>(["home", "docs", "404"]);
const GITHUB_USERNAME_PATTERN = /^(?!-)(?!.*--)[a-z\d-]{1,39}(?<!-)$/i;

const pageModules = import.meta.glob("/pages/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
}) as PageMap;

const remotePageCache = new Map<string, Promise<PageRecord | null>>();

function normalizeTheme(value: unknown): ThemeName {
  return value === "dark" || value === "adn" || value === "system" ? value : "light";
}

function normalizeAlign(value: unknown): PageAlign {
  return value === "middle" || value === "bottom" ? value : "top";
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
    align: normalizeAlign(frontmatter.align),
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

function parseGalleryDefinition(items: string[]): GalleryDefinition {
  return { items };
}

function extractGalleryBlocks(content: string, assetBase?: string): {
  content: string;
  galleries: GalleryMap;
} {
  const galleries: GalleryMap = {};
  let galleryIndex = 0;
  let inFence = false;
  let fenceMarker: string | null = null;
  const lines = content.split(/\r?\n/);
  const output: string[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();
    const fenceMatch = trimmed.match(/^(```+|~~~+)/);

    if (fenceMatch) {
      const marker = fenceMatch[1];

      if (!inFence) {
        inFence = true;
        fenceMarker = marker;
      } else if (fenceMarker === marker) {
        inFence = false;
        fenceMarker = null;
      }

      output.push(line);
      continue;
    }

    if (inFence) {
      output.push(line);
      continue;
    }

    const galleryStart = trimmed === "[[gallery]]";
    if (!galleryStart) {
      output.push(line);
      continue;
    }

    const items: string[] = [];
    let endIndex = index + 1;

    while (endIndex < lines.length) {
      const candidate = lines[endIndex].trim();

      if (candidate === "[[/gallery]]") {
        break;
      }

      if (candidate) {
        const source = candidate.match(/^!\[[^\]]*]\((.+?)\)$/)?.[1] ?? candidate;
        items.push(resolveAssetUrl(source, assetBase) ?? source);
      }

      endIndex += 1;
    }

    if (endIndex >= lines.length || lines[endIndex].trim() !== "[[/gallery]]") {
      output.push(line);
      continue;
    }

    if (items.length > 0) {
      const token = `@@GALLERY:${galleryIndex}@@`;
      galleries[token] = parseGalleryDefinition(items);
      output.push("", token, "");
      galleryIndex += 1;
    }

    index = endIndex;
  }

  return { content: output.join("\n"), galleries };
}

function parsePageRecord(raw: string, assetBase?: string, profileRoot?: string): PageRecord {
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

  const { content, galleries } = extractGalleryBlocks(body, assetBase);

  return {
    assetBase,
    content,
    frontmatter: parseFrontmatter(frontmatter),
    galleries,
    profileRoot,
  };
}

function buildNativePages(modules: PageMap): Map<NativeSlug, PageRecord> {
  const pages = new Map<NativeSlug, PageRecord>();

  for (const [filePath, raw] of Object.entries(modules)) {
    const match = filePath.match(/\/([^/]+)\.md$/);
    const slug = match?.[1]?.toLowerCase();

    if (!slug || !NATIVE_SLUGS.has(slug as NativeSlug)) {
      continue;
    }

    pages.set(slug as NativeSlug, parsePageRecord(raw));
  }

  return pages;
}

const nativePages = buildNativePages(pageModules);

function matchRoute(pathname: string): RouteMatch {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return { slug: "home", type: "native" };
  }

  const [segment, ...contentSegments] = segments;
  const slug = segment.toLowerCase();

  if (NATIVE_SLUGS.has(slug as NativeSlug)) {
    if (contentSegments.length > 0) {
      return { slug: "404", type: "not-found" };
    }

    return { slug: slug as NativeSlug, type: "native" };
  }

  if (GITHUB_USERNAME_PATTERN.test(segment)) {
    if (contentSegments.length === 0) {
      return { slug, type: "profile-root", username: segment };
    }

    return {
      contentPath: contentSegments.join("/"),
      slug: contentSegments[contentSegments.length - 1].toLowerCase(),
      type: "profile-content",
      username: segment,
    };
  }

  return { slug: "404", type: "not-found" };
}

async function loadRemotePage(username: string, contentPath?: string): Promise<PageRecord | null> {
  const cacheKey = `${username.toLowerCase()}:${contentPath ?? "human"}`;
  const cached = remotePageCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const promise = (async () => {
    for (const branch of GITHUB_BRANCHES) {
      try {
        const pagePath = contentPath ? `content/${contentPath}.md` : "human.md";
        const response = await fetch(buildGitHubRawUrl(username, branch, pagePath));
        if (!response.ok) {
          continue;
        }

        return parsePageRecord(
          await response.text(),
          buildGitHubRawBase(username, branch),
          `/${username.toLowerCase()}`,
        );
      } catch {
        continue;
      }
    }

    return null;
  })();

  remotePageCache.set(cacheKey, promise);
  return promise;
}

export function resolveSlug(pathname: string): string {
  return matchRoute(pathname).slug;
}

export async function loadPageContent(pathname: string): Promise<{
  page: PageRecord | null;
  slug: string;
}> {
  const route = matchRoute(pathname);

  if (route.type === "native") {
    return {
      page: nativePages.get(route.slug) ?? nativePages.get("404") ?? null,
      slug: route.slug,
    };
  }

  if (route.type === "profile-root") {
    const page = await loadRemotePage(route.username);

    return {
      page: page ?? nativePages.get("404") ?? null,
      slug: page ? route.slug : "404",
    };
  }

  if (route.type === "profile-content") {
    const page = await loadRemotePage(route.username, route.contentPath);

    return {
      page: page ?? nativePages.get("404") ?? null,
      slug: page ? route.slug : "404",
    };
  }

  return {
    page: nativePages.get("404") ?? null,
    slug: "404",
  };
}
