"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

function optedOut() {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.doNotTrack === "1" || nav.globalPrivacyControl === true;
}

export function Beacon() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (optedOut()) return;
    const referrer = first.current ? document.referrer : location.origin;
    const utm = first.current ? new URLSearchParams(location.search).get("utm_source") : null;
    first.current = false;
    const body = JSON.stringify({ path: pathname, referrer, utm });
    if (!navigator.sendBeacon?.("/api/hit", body)) {
      void fetch("/api/hit", { method: "POST", body, keepalive: true }).catch(() => {});
    }
  }, [pathname]);

  return null;
}
