/* eslint-disable react-refresh/only-export-components */
import {
  Children,
  cloneElement,
  createElement,
  type CSSProperties,
  type HTMLAttributes,
  isValidElement,
  type ReactNode,
} from "react";
import type { Components } from "react-markdown";

import type { GalleryDefinition, GalleryMap } from "../content/types";
import { Gallery } from "./Gallery";
import { isVideoSource } from "./media";

type BlockTag = keyof Pick<
  HTMLElementTagNameMap,
  | "blockquote"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "hr"
  | "ol"
  | "p"
  | "pre"
  | "table"
  | "ul"
>;

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

function extractGalleryItems(
  children: ReactNode,
  galleries: GalleryMap,
): GalleryDefinition | null {
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

function mergeClassName(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ") || undefined;
}

function cleanNodeProp(props: { node?: unknown } & Record<string, unknown>) {
  const { node, ...rest } = props;
  void node;
  return rest;
}

function withClassName(element: ReactNode, className: string) {
  if (!isValidElement<{ className?: string }>(element)) {
    return element;
  }

  return cloneElement(element, {
    className: mergeClassName(element.props.className, className),
  });
}

function MarkdownLink({
  children,
  ...props
}: HTMLAttributes<HTMLAnchorElement> & {
  children?: ReactNode;
  node?: unknown;
}) {
  return (
    <a {...cleanNodeProp(props)} className={mergeClassName(props.className, "markdown-link")}>
      <span className="markdown-link__label">{withClassName(children, "markdown-link__label")}</span>
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
  src,
  title,
}: HTMLAttributes<HTMLImageElement> & {
  alt?: string | null;
  className?: string;
  node?: unknown;
  src?: string;
  title?: string;
}) {
  const parsed = parseImageDimensions(alt);
  const isVideo = isVideoSource(src);
  const mediaClassName = mergeClassName(
    className,
    "markdown-media",
    parsed.width && parsed.height ? "markdown-media--framed" : undefined,
  );

  if (isVideo) {
    return (
      <video
        autoPlay
        {...cleanNodeProp({ alt, className, src, title })}
        className={mediaClassName}
        height={parsed.height}
        loop
        muted
        playsInline
        src={src}
        title={title}
        width={parsed.width}
      />
    );
  }

  return (
    <img
      {...cleanNodeProp({ className, src, title })}
      alt={parsed.alt}
      className={mediaClassName}
      height={parsed.height}
      src={src}
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
      const gallery = extractGalleryItems(children, galleries);
      if (gallery) {
        return <Gallery {...gallery} />;
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
