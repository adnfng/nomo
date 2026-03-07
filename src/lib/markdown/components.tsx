/* eslint-disable react-refresh/only-export-components */
import {
  Children,
  createElement,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import type { Components } from "react-markdown";

import type { GalleryMap } from "../content/types";
import { Gallery } from "./Gallery";
import { isVideoSource } from "./media";

type BlockTag = keyof Pick<
  HTMLElementTagNameMap,
  "blockquote" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "hr" | "ol" | "p" | "pre" | "table" | "ul"
>;

const MEDIA_MARGIN = "0.35em";

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

function extractGalleryItems(children: ReactNode, galleries: GalleryMap): string[] | null {
  const items = Children.toArray(children);
  if (items.length !== 1 || typeof items[0] !== "string") {
    return null;
  }

  const token = items[0].trim();
  return galleries[token] ?? null;
}

function parseImageDimensions(alt: string | null | undefined): {
  alt: string | undefined;
  width: number | undefined;
  height: number | undefined;
} {
  if (!alt) {
    return { alt: alt ?? undefined, width: undefined, height: undefined };
  }

  const match = alt.match(/^(.*?):(\d+)(?:x(\d+))?$/);
  if (!match) {
    return { alt, width: undefined, height: undefined };
  }

  return {
    alt: match[1].trim() || undefined,
    width: Number(match[2]),
    height: match[3] ? Number(match[3]) : undefined,
  };
}

function buildMediaStyle(
  style: CSSProperties | undefined,
  width: number | undefined,
  height: number | undefined,
): CSSProperties {
  const hasFixedFrame = Boolean(width && height);

  return {
    ...style,
    marginTop: MEDIA_MARGIN,
    marginBottom: MEDIA_MARGIN,
    objectFit: hasFixedFrame ? "cover" : style?.objectFit,
    objectPosition: hasFixedFrame ? "center" : style?.objectPosition,
    width: width ? `${width}px` : style?.width,
    height: height ? `${height}px` : style?.height,
  };
}

function MarkdownLink({
  children,
  node,
  ...props
}: HTMLAttributes<HTMLAnchorElement> & {
  children?: ReactNode;
  node?: unknown;
}) {
  void node;

  return (
    <a {...props} className="markdown-link">
      <span className="markdown-link__label">{children}</span>
      <svg
        aria-hidden="true"
        className="markdown-link__icon"
        fill="none"
        height="12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="12"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M7 7h10v10" />
        <path d="M7 17 17 7" />
      </svg>
    </a>
  );
}

function MarkdownMedia({
  alt,
  className,
  node,
  src,
  style,
  title,
}: HTMLAttributes<HTMLImageElement> & {
  alt?: string | null;
  className?: string;
  node?: unknown;
  src?: string;
  title?: string;
}) {
  void node;

  const parsed = parseImageDimensions(alt);
  const isVideo = isVideoSource(src);
  const mediaStyle = buildMediaStyle(style, parsed.width, parsed.height);

  if (isVideo) {
    return (
      <video
        autoPlay
        className={className}
        loop
        muted
        playsInline
        src={src}
        style={mediaStyle}
        title={title}
      />
    );
  }

  return (
    <img
      alt={parsed.alt}
      className={className}
      height={parsed.height}
      src={src}
      style={mediaStyle}
      title={title}
      width={parsed.width}
    />
  );
}

export function createMarkdownComponents(galleries: GalleryMap): Components {
  return {
    a: MarkdownLink,
    blockquote: withBlockGap("blockquote"),
    h1: withBlockGap("h1"),
    h2: withBlockGap("h2"),
    h3: withBlockGap("h3"),
    h4: withBlockGap("h4"),
    h5: withBlockGap("h5"),
    h6: withBlockGap("h6"),
    hr: withBlockGap("hr"),
    img: MarkdownMedia,
    ol: withBlockGap("ol"),
    p: ({ children, node, style, ...props }) => {
      const items = extractGalleryItems(children, galleries);
      if (items) {
        return <Gallery items={items} />;
      }

      return createElement("p", {
        ...props,
        style: buildBlockStyle(node?.properties, style),
        children,
      });
    },
    pre: withBlockGap("pre"),
    table: withBlockGap("table"),
    ul: withBlockGap("ul"),
  };
}
