import { Link } from "react-router-dom";

const NOMO_GITHUB = "https://github.com/adnfng/nomo";

export function Footer({ native }: { native: boolean }) {
  if (native) {
    return (
      <footer className="app-footer">
        <span className="markdown-muted">see nomo on </span>
        <a className="markdown-link" href={NOMO_GITHUB} rel="noreferrer" target="_blank">
          <span className="markdown-link__label">github</span>
        </a>
      </footer>
    );
  }
  return (
    <footer className="app-footer">
      <span className="markdown-muted">create your page with </span>
      <Link className="markdown-link" to="/">
        <span className="markdown-link__label">nomo</span>
      </Link>
    </footer>
  );
}
