"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Veil } from "./Veil";

export function BackBar() {
  const pathname = usePathname();
  const first = useRef(pathname);
  const [navigated, setNavigated] = useState(false);

  useEffect(() => {
    if (pathname !== first.current) setNavigated(true);
  }, [pathname]);

  if (!navigated || pathname === "/") return null;
  return <>
    <Veil edge="top" />
    <nav className="back-bar" aria-label="Back">
      <Link className="back-bar__button" href="/">
        <svg aria-hidden="true" fill="none" height="12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="12">
          <path d="M19 12H5" />
          <path d="m11 18-6-6 6-6" />
        </svg>
        back
      </Link>
    </nav>
  </>;
}
