import { useLayoutEffect, useRef, useState, type AnimationEvent, type ReactNode } from 'react';

export function PageFade({ id, children }: { id: string; children: ReactNode }) {
  const [leave, setLeave] = useState<ReactNode>(null);
  const prev = useRef({ id, children });

  useLayoutEffect(() => {
    if (prev.current.id === id) {
      prev.current.children = children;
      return;
    }
    const outgoing = prev.current.children;
    prev.current = { id, children };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setLeave(outgoing);
  }, [id, children]);

  function endLeave(event: AnimationEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) setLeave(null);
  }

  return <div className="page-fade">
    {leave ? <div aria-hidden className="page-fade__leave" onAnimationEnd={endLeave}>{leave}</div> : null}
    <div className="page-fade__live" key={id}>{children}</div>
  </div>;
}
