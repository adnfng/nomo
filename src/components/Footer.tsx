import { Link } from "react-router-dom";

const NOMO_GITHUB = "https://github.com/adnfng/nomo";

function LinkArrow() {
  return (
    <svg
      aria-hidden="true"
      className="markdown-link__icon"
      fill="none"
      height="12"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="12"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  );
}

export function Footer({ native }: { native: boolean }) {
  if (native) {
    return (
      <footer className="app-footer">
        <span className="markdown-muted">see nomo on </span>
        <a className="markdown-link markdown-link--arrow" href={NOMO_GITHUB} rel="noreferrer" target="_blank">
          <span className="markdown-link__label">github</span>
          <LinkArrow />
        </a>
      </footer>
    );
  }
  return (
    <footer className="app-footer">
      <span className="markdown-muted">create your page with </span>
      <Link className="markdown-link markdown-link--arrow" to="/">
        <span className="markdown-link__label">nomo</span>
        <LinkArrow />
      </Link>
    </footer>
  );
}
