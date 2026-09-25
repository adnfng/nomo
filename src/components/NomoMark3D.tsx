"use client";

import { useEffect, useRef, useState } from 'react';
import { preload } from 'react-dom';
import { NOMO_MARK_PATH, sessionLogoColor } from '../lib/theme/nomoMark';

const MODEL = '/nomo.glb';

function NomoMarkFlat({ color, className }: { color: string; className: string }) {
  return <svg aria-hidden className={className} fill="none" viewBox="0 0 275 288" xmlns="http://www.w3.org/2000/svg">
    <path d={NOMO_MARK_PATH} fill={color} />
  </svg>;
}

export function NomoMark3D() {
  preload(MODEL, { as: 'fetch', crossOrigin: 'anonymous' });
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const node = host.current;
    if (!node) return;
    let cancelled = false;
    let dispose = () => {};
    const model = fetch(MODEL).then(response => {
      if (!response.ok) throw new Error(`Model ${response.status}`);
      return response.arrayBuffer();
    });
    void Promise.all([import('./nomo-mark-3d'), model]).then(([{ mountNomoMark3D }, buffer]) => {
      if (cancelled) return;
      try {
        dispose = mountNomoMark3D(node, sessionLogoColor, buffer, () => setReady(true), () => setFailed(true));
      } catch {
        setFailed(true);
      }
    }).catch(() => {
      if (!cancelled) setFailed(true);
    });
    return () => {
      cancelled = true;
      dispose();
    };
  }, []);

  if (failed) return <NomoMarkFlat color={sessionLogoColor} className="nomo-mark-3d" />;
  return <div ref={host} className="nomo-mark-3d" data-ready={ready || undefined}>
    <NomoMarkFlat color={sessionLogoColor} className="nomo-mark-3d__flat" />
  </div>;
}
