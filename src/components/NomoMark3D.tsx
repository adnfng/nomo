import { useEffect, useRef, useState } from 'react';
import { NOMO_MARK_PATH, sessionLogoColor } from '../lib/theme/nomoMark';

function NomoMarkFallback({ color }: { color: string }) {
  return <svg aria-hidden className="nomo-mark-3d" fill="none" viewBox="0 0 275 288" xmlns="http://www.w3.org/2000/svg">
    <path d={NOMO_MARK_PATH} fill={color} />
  </svg>;
}

export function NomoMark3D() {
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const node = host.current;
    if (!node) return;
    let cancelled = false;
    let dispose = () => {};
    void import('./nomo-mark-3d').then(({ mountNomoMark3D }) => {
      if (cancelled) return;
      try {
        dispose = mountNomoMark3D(node, sessionLogoColor, () => setFailed(true));
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

  if (failed) return <NomoMarkFallback color={sessionLogoColor} />;
  return <div ref={host} className="nomo-mark-3d" />;
}
