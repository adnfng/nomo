"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Veil } from "./Veil";

export function BackBar() {
  const pathname = usePathname();
  const router = useRouter();
  const last = useRef(pathname);
  const depth = useRef(0);
  const popped = useRef(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onPop = () => { popped.current = true; };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (pathname === last.current) return;
    last.current = pathname;
    depth.current = popped.current ? Math.max(0, depth.current - 1) : depth.current + 1;
    popped.current = false;
    setVisible(depth.current > 0);
  }, [pathname]);

  if (!visible) return null;
  return <>
    <Veil edge="top" />
    <nav className="back-bar" aria-label="Back">
      <button className="back-bar__button" type="button" onClick={() => router.back()}>
        <svg aria-hidden="true" fill="none" height="12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="12">
          <path d="M19 12H5" />
          <path d="m11 18-6-6 6-6" />
        </svg>
        back
      </button>
    </nav>
  </>;
}
