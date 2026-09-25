import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

function LinkArrow() {
  return (
    <svg aria-hidden="true" className="markdown-link__icon" fill="none" height="12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="12" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  );
}

const NOMO_GITHUB = "https://github.com/adnfng/nomo";
const MONTH = new Intl.DateTimeFormat("en", { month: "short", year: "numeric", timeZone: "UTC" });

function Credit({ native }: { native: boolean }) {
  if (native) return <span>
    <span className="markdown-muted">see nomo on </span>
    <a className="markdown-link markdown-link--arrow" href={NOMO_GITHUB} rel="noreferrer" target="_blank">
      <span className="markdown-link__label">github</span>
      <LinkArrow />
    </a>
  </span>;
  return <span>
    <span className="markdown-muted">made with </span>
    <Link className="markdown-link markdown-link--arrow" href="/">
      <span className="markdown-link__label">nomo</span>
      <LinkArrow />
    </Link>
  </span>;
}

export function Footer({ native = false, updated }: { native?: boolean; updated?: string }) {
  return (
    <footer className="app-footer">
      <Credit native={native} />
      <span className="app-footer__end">
        {updated ? <span className="markdown-muted">updated <time dateTime={updated}>{MONTH.format(new Date(updated)).toLowerCase()}</time></span> : null}
        <ThemeToggle />
      </span>
    </footer>
  );
}
