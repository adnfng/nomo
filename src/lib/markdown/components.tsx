/* eslint-disable react-refresh/only-export-components */
import {
  type AnchorHTMLAttributes,
  Children,
  cloneElement,
  createElement,
  type CSSProperties,
  type HTMLAttributes,
  isValidElement,
  type ReactNode,
} from "react";
import { Link } from "react-router-dom";
import type { Components } from "react-markdown";

import { isExternalHref, resolveAssetUrl, resolveContentHref } from "../content/paths";
import type { GalleryDefinition, GalleryMap } from "../content/types";
import { NOMO_MARK_PATH } from "../theme/nomoMark";
import { Gallery } from "./Gallery";
import { isVideoSource, silentLoopVideoProps } from "./media";

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

function buildMediaStyle(width?: number, height?: number): CSSProperties | undefined {
  if (!width && !height) {
    return undefined;
  }

  return {
    height: height ? `${height}px` : undefined,
    width: width ? `${width}px` : undefined,
  };
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
  assetBase,
  children,
  href,
  profileRoot,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  assetBase?: string;
  children?: ReactNode;
  node?: unknown;
  profileRoot?: string;
}) {
  const resolvedHref = resolveAssetUrl(resolveContentHref(href, profileRoot), assetBase);
  const content = (
    <>
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
    </>
  );

  if (resolvedHref?.startsWith("/")) {
    return (
      <Link
        {...cleanNodeProp(props)}
        className={mergeClassName(props.className, "markdown-link")}
        to={resolvedHref}
      >
        {content}
      </Link>
    );
  }

  return (
    <a
      {...cleanNodeProp(props)}
      className={mergeClassName(props.className, "markdown-link")}
      href={resolvedHref}
      rel={isExternalHref(resolvedHref) ? "noreferrer" : props.rel}
      target={isExternalHref(resolvedHref) ? "_blank" : props.target}
    >
      {content}
    </a>
  );
}

function NomoMark({
  alt,
  className,
  height,
  style,
  title,
  width,
}: {
  alt?: string;
  className?: string;
  height?: number;
  style?: CSSProperties;
  title?: string;
  width?: number;
}) {
  return (
    <svg
      aria-label={alt}
      className={className}
      fill="none"
      height={height}
      role={alt ? "img" : undefined}
      style={style}
      viewBox="0 0 275 288"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      {title ? <title>{title}</title> : null}
      <path d={NOMO_MARK_PATH} fill="currentColor" />
    </svg>
  );
}

function MarkdownMedia({
  alt,
  assetBase,
  className,
  src,
  title,
}: HTMLAttributes<HTMLImageElement> & {
  alt?: string | null;
  assetBase?: string;
  className?: string;
  node?: unknown;
  src?: string;
  title?: string;
}) {
  const parsed = parseImageDimensions(alt);
  const resolvedSrc = resolveAssetUrl(src, assetBase);
  const isVideo = isVideoSource(resolvedSrc);
  const mediaStyle = buildMediaStyle(parsed.width, parsed.height);
  const mediaClassName = mergeClassName(
    className,
    "markdown-media",
    parsed.width && parsed.height ? "markdown-media--framed" : undefined,
  );
  const isNomoMark = resolvedSrc?.replace(/^\.\//, "") === "/nomo.svg" || resolvedSrc === "nomo.svg";

  if (isVideo) {
    return (
      <video
        {...silentLoopVideoProps}
        {...cleanNodeProp({ alt, className, src, title })}
        className={mediaClassName}
        height={parsed.height}
        src={resolvedSrc}
        style={mediaStyle}
        title={title}
        width={parsed.width}
      />
    );
  }

  if (isNomoMark) {
    return (
      <NomoMark
        alt={parsed.alt}
        className={mergeClassName(mediaClassName, "markdown-media--nomo")}
        height={parsed.height}
        style={mediaStyle}
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
      src={resolvedSrc}
      style={mediaStyle}
      title={title}
      width={parsed.width}
    />
  );
}

export function createMarkdownComponents(
  galleries: GalleryMap,
  assetBase?: string,
  profileRoot?: string,
  renderTimeline?: (token: string) => ReactNode,
): Components {
  return {
    a: ({ href, ...props }) => (
      <MarkdownLink {...props} assetBase={assetBase} href={href} profileRoot={profileRoot} />
    ),
    blockquote: withBlockGap("blockquote"),
    h1: withBlockGap("h1"),
    h2: withBlockGap("h2"),
    h3: withBlockGap("h3"),
    h4: withBlockGap("h4"),
    h5: withBlockGap("h5"),
    h6: withBlockGap("h6"),
    hr: withBlockGap("hr"),
    img: (props) => <MarkdownMedia {...props} assetBase={assetBase} />,
    ol: withBlockGap("ol"),
    p: ({ children, node, style, ...props }) => {
      const timeline = typeof children === 'string' ? renderTimeline?.(children.trim()) : null;
      if (timeline) return <div className="markdown-timeline-block">{timeline}</div>;
      const gallery = extractGalleryItems(children, galleries);
      if (gallery) {
        return (
          <div
            {...props}
            className={mergeClassName(
              typeof props.className === "string" ? props.className : undefined,
              "markdown-gallery-block",
            )}
            style={buildBlockStyle(node?.properties, style)}
          >
            <Gallery {...gallery} />
          </div>
        );
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
