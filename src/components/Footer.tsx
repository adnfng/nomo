import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="app-footer">
      <span className="markdown-muted">Created with</span>{" "}
      <Link className="markdown-link" to="/">
        <span className="markdown-link__label">nomo</span>
      </Link>
    </footer>
  );
}
