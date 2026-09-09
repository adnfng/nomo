import { type CSSProperties } from "react";
import { Link } from "react-router-dom";

const NOMO_GITHUB = "https://github.com/adnfng/nomo";
const VEIL_LAYERS = 8;

function veilStyle(index: number): CSSProperties {
  const segment = 1 / (VEIL_LAYERS + 1);
  const stops = [0, 1, 2, 3].map((step, pos) => {
    const alpha = pos === 1 || pos === 2 ? 1 : 0;
    return `rgba(255,255,255,${alpha}) ${(index + step) * segment * 100}%`;
  });
  const mask = `linear-gradient(180deg, ${stops.join(", ")})`;
  const blur = `blur(${index * 2.5}px)`;
  return { maskImage: mask, WebkitMaskImage: mask, backdropFilter: blur, WebkitBackdropFilter: blur };
}

function FooterVeil() {
  return (
    <div aria-hidden className="footer-veil">
      {Array.from({ length: VEIL_LAYERS }, (_, index) => <span key={index} style={veilStyle(index)} />)}
    </div>
  );
}

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
  const body = native ? (
    <footer className="app-footer">
      <span className="markdown-muted">see nomo on </span>
      <a className="markdown-link markdown-link--arrow" href={NOMO_GITHUB} rel="noreferrer" target="_blank">
        <span className="markdown-link__label">github</span>
        <LinkArrow />
      </a>
    </footer>
  ) : (
    <footer className="app-footer">
      <span className="markdown-muted">create your page with </span>
      <Link className="markdown-link markdown-link--arrow" to="/">
        <span className="markdown-link__label">nomo</span>
        <LinkArrow />
      </Link>
    </footer>
  );
  return <>
    <FooterVeil />
    {body}
  </>;
}
