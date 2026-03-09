import { type CSSProperties, type PointerEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { type GalleryDefinition } from "../content/types";
import { isVideoSource } from "./media";

type GalleryItemProps = {
  children: ReactNode;
  frameStyle: CSSProperties;
  onClick: () => void;
};

type LightboxState = {
  index: number;
  status: "open" | "closing";
} | null;

const TILT_MAX_DEGREES = 9;

function buildTiltTransform(offsetX: number, offsetY: number) {
  const rotateX = -offsetY * TILT_MAX_DEGREES;
  const rotateY = offsetX * TILT_MAX_DEGREES;

  return `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(0, 0, 0)`;
}

function closeLightboxState(state: LightboxState): LightboxState {
  return state ? { ...state, status: "closing" } : null;
}

function GalleryItem({ children, frameStyle, onClick }: GalleryItemProps) {
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

    if (buttonRef.current) {
      buttonRef.current.style.transform = buildTiltTransform(targetRef.current.x, targetRef.current.y);
    }
  };

  const queueTiltUpdate = () => {
    if (frameRef.current === null) {
      frameRef.current = window.requestAnimationFrame(applyTilt);
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === "touch") {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    targetRef.current = {
      x: Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1)),
      y: Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1)),
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
      style={frameStyle}
      type="button"
    >
      {children}
    </button>
  );
}

export function Gallery({ height, items, width }: GalleryDefinition) {
  const [lightbox, setLightbox] = useState<LightboxState>(null);

  const mediaItems = items.map((src) => ({
    src,
    isVideo: isVideoSource(src),
  }));

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

  const galleryStyle = width
    ? ({ gridTemplateColumns: `repeat(auto-fill, ${width}px)` } as CSSProperties)
    : undefined;

  const frameStyle: CSSProperties = width
    ? {
        width: `${width}px`,
        ...(height ? { height: `${height}px` } : {}),
      }
    : { width: "100%" };

  const mediaClassName = height
    ? "markdown-gallery__media markdown-gallery__media--fixed-height"
    : "markdown-gallery__media";

  return (
    <>
      <div className="markdown-gallery" data-custom-width={width ? "true" : undefined} style={galleryStyle}>
        {mediaItems.map((item, index) => (
          <GalleryItem
            key={`${item.src}-${index}`}
            frameStyle={frameStyle}
            onClick={() => setLightbox({ index, status: "open" })}
          >
            {item.isVideo ? (
              <video autoPlay className={mediaClassName} loop muted playsInline src={item.src} />
            ) : (
              <img alt="" className={mediaClassName} src={item.src} />
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
              <div className="markdown-lightbox__media-wrap" onClick={(event) => event.stopPropagation()}>
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
