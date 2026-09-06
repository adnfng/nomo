import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BALL_PALETTE } from '../lib/theme/nomoMark';

function pick(seed: number, index: number, min: number, max: number, salt: number) {
  return min + ((seed + index * 67 + salt * 131) * 1103515245 + 12345 >>> 0) % (max - min + 1);
}

function signed(seed: number, index: number, min: number, max: number, salt: number) {
  const value = pick(seed, index, min, max, salt);
  return ((seed + index * 53 + salt * 97) >>> 0) % 2 ? value : -value;
}

function CssBalls({ letters }: { letters: string }) {
  const seed = Array.from(letters).reduce((sum, char) => sum * 31 + char.charCodeAt(0), 7) >>> 0;
  return <>{Array.from(letters).map((char, index) => <span
    key={`${char}-${index}`}
    className="pool-ball"
    style={{
      '--ball-color': BALL_PALETTE[index % BALL_PALETTE.length],
      '--ball-rotation': `${signed(seed, index, 8, 16, 0)}deg`,
      '--ball-hover-y': `${-pick(seed, index, 2, 4, 2)}px`,
    } as CSSProperties}
  ><span>{char.toLowerCase()}</span></span>)}</>;
}

export function PoolBalls({ letters, home }: { letters: string; home: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const node = host.current;
    if (!node || failed) return;
    let cancelled = false;
    let dispose = () => {};
    void import('./pool-balls-3d').then(({ mountPoolBalls3D }) => {
      if (cancelled) return;
      try {
        dispose = mountPoolBalls3D(node, letters, () => setFailed(true));
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
  }, [failed, letters]);

  return <div className="profile-avatar-wrap">
    <Link aria-label="Home" className="profile-balls" to={home}>
      {failed ? <CssBalls letters={letters} /> : <div ref={host} className="pool-balls-3d" />}
    </Link>
  </div>;
}
