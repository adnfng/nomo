import { type PointerEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { isVideoSource } from "./media";

type GalleryProps = {
  items: string[];
};

type MediaMetadata = {
  width: number;
  height: number;
};

type LightboxState = {
  index: number;
  status: "open" | "closing";
} | null;

const MAX_GALLERY_HEIGHT = 125;
const DESKTOP_COLUMNS = 3;
const MOBILE_COLUMNS = 2;
const MOBILE_BREAKPOINT = "(max-width: 720px)";
const TILT_MAX_DEGREES = 9;

type GalleryItemProps = {
  children: ReactNode;
  onClick: () => void;
  width: string;
};

function getColumnCount(itemCount: number, isCompactViewport: boolean) {
  const maxColumns = isCompactViewport ? MOBILE_COLUMNS : DESKTOP_COLUMNS;
  return Math.max(1, Math.min(itemCount, maxColumns));
}

function getDisplayWidth(
  metadata: MediaMetadata | undefined,
  targetColumnWidth: number,
): number {
  if (!metadata || metadata.width <= 0 || metadata.height <= 0) {
    return targetColumnWidth;
  }

  const aspectRatio = metadata.width / metadata.height;
  return Math.min(targetColumnWidth, MAX_GALLERY_HEIGHT * aspectRatio);
}

function buildTiltTransform(offsetX: number, offsetY: number) {
  const rotateX = -offsetY * TILT_MAX_DEGREES;
  const rotateY = offsetX * TILT_MAX_DEGREES;

  return `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(0, 0, 0)`;
}

function closeLightboxState(state: LightboxState): LightboxState {
  return state ? { ...state, status: "closing" } : null;
}

function GalleryItem({ children, onClick, width }: GalleryItemProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const targetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const applyTilt = () => {
    frameRef.current = null;

    const node = buttonRef.current;
    if (!node) {
      return;
    }

    node.style.transform = buildTiltTransform(targetRef.current.x, targetRef.current.y);
  };

  const queueTiltUpdate = () => {
    if (frameRef.current !== null) {
      return;
    }

    frameRef.current = window.requestAnimationFrame(applyTilt);
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === "touch") {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const normalizedX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const normalizedY = ((event.clientY - rect.top) / rect.height) * 2 - 1;

    targetRef.current = {
      x: Math.max(-1, Math.min(1, normalizedX)),
      y: Math.max(-1, Math.min(1, normalizedY)),
    };

    event.currentTarget.dataset.tiltActive = "true";
    queueTiltUpdate();
  };

  const handlePointerLeave = () => {
    targetRef.current = { x: 0, y: 0 };

    if (buttonRef.current) {
      buttonRef.current.dataset.tiltActive = "false";
    }

    queueTiltUpdate();
  };

  return (
    <button
      ref={buttonRef}
      className="markdown-gallery__item"
      data-tilt-active="false"
      onClick={onClick}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      style={{ width }}
      type="button"
    >
      {children}
    </button>
  );
}

export function Gallery({ items }: GalleryProps) {
  const [lightbox, setLightbox] = useState<LightboxState>(null);
  const [isCompactViewport, setIsCompactViewport] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [columnGap, setColumnGap] = useState(0);
  const [mediaMetadata, setMediaMetadata] = useState<Record<string, MediaMetadata>>({});
  const galleryRef = useRef<HTMLDivElement | null>(null);

  const mediaItems = items.map((src) => ({
    src,
    isVideo: isVideoSource(src),
  }));

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT);
    const updateViewport = () => {
      setIsCompactViewport(mediaQuery.matches);
    };

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);

    return () => {
      mediaQuery.removeEventListener("change", updateViewport);
    };
  }, []);

  useEffect(() => {
    const node = galleryRef.current;
    if (!node) {
      return;
    }

    const updateMetrics = () => {
      const styles = window.getComputedStyle(node);
      const nextGap = Number.parseFloat(styles.columnGap || styles.gap || "0");

      setContainerWidth(node.clientWidth);
      setColumnGap(Number.isFinite(nextGap) ? nextGap : 0);
    };

    updateMetrics();

    const observer = new ResizeObserver(() => {
      updateMetrics();
    });

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!lightbox) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightbox(closeLightboxState);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightbox]);

  useEffect(() => {
    if (lightbox?.status !== "closing") {
      return;
    }

    const timer = window.setTimeout(() => {
      setLightbox(null);
    }, 180);

    return () => {
      window.clearTimeout(timer);
    };
  }, [lightbox]);

  const handleMediaMetadata = (src: string, width: number, height: number) => {
    if (width <= 0 || height <= 0) {
      return;
    }

    setMediaMetadata((current) => {
      const previous = current[src];
      if (previous?.width === width && previous.height === height) {
        return current;
      }

      return {
        ...current,
        [src]: { width, height },
      };
    });
  };

  const columnCount = getColumnCount(mediaItems.length, isCompactViewport);
  const availableWidth = Math.max(containerWidth - columnGap * (columnCount - 1), 0);
  const targetColumnWidth = columnCount > 0 ? availableWidth / columnCount : 0;

  const itemWidths = mediaItems.map((item) =>
    targetColumnWidth > 0 ? getDisplayWidth(mediaMetadata[item.src], targetColumnWidth) : 0,
  );

  const trackWidths = Array.from({ length: columnCount }, (_, columnIndex) => {
    let widestItem = 0;

    for (let itemIndex = columnIndex; itemIndex < itemWidths.length; itemIndex += columnCount) {
      widestItem = Math.max(widestItem, itemWidths[itemIndex] ?? 0);
    }

    return widestItem;
  });

  const galleryStyle =
    trackWidths.some((width) => width > 0) && trackWidths.length > 0
      ? {
          gridTemplateColumns: trackWidths.map((width) => `${width}px`).join(" "),
        }
      : {
          gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
        };

  return (
    <>
      <div className="markdown-gallery" ref={galleryRef} style={galleryStyle}>
        {mediaItems.map((item, index) => (
          <GalleryItem
            key={`${item.src}-${index}`}
            onClick={() => setLightbox({ index, status: "open" })}
            width={itemWidths[index] ? `${itemWidths[index]}px` : "100%"}
          >
            {item.isVideo ? (
              <video
                autoPlay
                className="markdown-gallery__media"
                loop
                muted
                onLoadedMetadata={(event) =>
                  handleMediaMetadata(
                    item.src,
                    event.currentTarget.videoWidth,
                    event.currentTarget.videoHeight,
                  )
                }
                playsInline
                preload="metadata"
                src={item.src}
              />
            ) : (
              <img
                alt=""
                className="markdown-gallery__media"
                onLoad={(event) =>
                  handleMediaMetadata(
                    item.src,
                    event.currentTarget.naturalWidth,
                    event.currentTarget.naturalHeight,
                  )
                }
                src={item.src}
              />
            )}
          </GalleryItem>
        ))}
      </div>

      {lightbox
        ? createPortal(
            <button
              className="markdown-lightbox"
              data-state={lightbox.status}
              onClick={() => setLightbox(closeLightboxState)}
              type="button"
            >
              <div
                className="markdown-lightbox__media-wrap"
                onClick={(event) => event.stopPropagation()}
              >
                {mediaItems[lightbox.index]?.isVideo ? (
                  <video
                    autoPlay
                    className="markdown-lightbox__media"
                    loop
                    muted
                    playsInline
                    src={mediaItems[lightbox.index].src}
                  />
                ) : (
                  <img
                    alt=""
                    className="markdown-lightbox__media"
                    src={mediaItems[lightbox.index]?.src}
                  />
                )}
              </div>
            </button>,
            document.body,
          )
        : null}
    </>
  );
}
