import { type PointerEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { type GalleryDefinition } from "../content/types";
import { isVideoSource, silentLoopVideoProps } from "./media";

type GalleryItemProps = {
  children: ReactNode;
  onClick: () => void;
  label: string;
};

const TILT_MAX_DEGREES = 9;

function buildTiltTransform(offsetX: number, offsetY: number) {
  const rotateX = -offsetY * TILT_MAX_DEGREES;
  const rotateY = offsetX * TILT_MAX_DEGREES;

  return `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(0, 0, 0)`;
}

function GalleryItem({ children, onClick, label }: GalleryItemProps) {
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
    if (event.pointerType === "touch" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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
      aria-label={label}
      ref={buttonRef}
      className="markdown-gallery__item"
      data-tilt-active="false"
      onClick={onClick}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      type="button"
    >
      {children}
    </button>
  );
}

function Lightbox({ src, isVideo, onClose }: { src: string; isVideo: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const element = dialog.current;
    element?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    };
  }, []);
  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(onClose, 180);
    return () => window.clearTimeout(timer);
  }, [closing, onClose]);
  return createPortal(
    <dialog ref={dialog} aria-label="Gallery preview" className="markdown-lightbox" data-state={closing ? 'closing' : 'open'}
      onCancel={event => { event.preventDefault(); setClosing(true); }}
      onClick={event => { if (event.target === event.currentTarget) setClosing(true); }}>
      <button autoFocus className="lightbox-close" type="button" onClick={() => setClosing(true)} aria-label="Close preview">×</button>
      <div className="markdown-lightbox__media-wrap">
        {isVideo ? <video {...silentLoopVideoProps} className="markdown-lightbox__media" src={src} />
          : <img alt="Gallery image" className="markdown-lightbox__media" src={src} />}
      </div>
    </dialog>, document.body);
}

export function Gallery({ items }: GalleryDefinition) {
  const [active, setActive] = useState<number | null>(null);
  return <>
    <div className="markdown-gallery">
      {items.map((src, index) => <GalleryItem key={`${src}-${index}`} label={`Open ${isVideoSource(src) ? 'video' : 'image'} ${index + 1}`} onClick={() => setActive(index)}>
        {isVideoSource(src) ? <video {...silentLoopVideoProps} className="markdown-gallery__media" src={src} />
          : <img alt="" className="markdown-gallery__media" src={src} />}
      </GalleryItem>)}
    </div>
    {active !== null && <Lightbox src={items[active]} isVideo={isVideoSource(items[active])} onClose={() => setActive(null)} />}
  </>;
}
