"use client";

import { useEffect, useRef, useState } from 'react';
import { preload } from 'react-dom';
import { sessionLogoColor } from '../lib/theme/nomoMark';

const MODEL = '/nomo.glb';

export function NomoMark3D() {
  preload(MODEL, { as: 'fetch', crossOrigin: 'anonymous' });
  const host = useRef<HTMLDivElement>(null);
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
      if (!cancelled) dispose = mountNomoMark3D(node, sessionLogoColor, buffer, () => setReady(true));
    }).catch(() => {});
    return () => {
      cancelled = true;
      dispose();
    };
  }, []);

  return <div ref={host} className="nomo-mark-3d" data-ready={ready || undefined} />;
}
