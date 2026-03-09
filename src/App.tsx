import ReactMarkdown from "react-markdown";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { loadPageContent, resolveSlug } from "./lib/content/pages";
import type { PageRecord } from "./lib/content/types";
import { createMarkdownComponents } from "./lib/markdown/components";
import { markdownRemarkPlugins } from "./lib/markdown/plugins";
import { usePagePresentation } from "./lib/theme/pagePresentation";

function App() {
  const location = useLocation();
  const routeSlug = resolveSlug(location.pathname);
  const [pageState, setPageState] = useState<{ page: PageRecord | null; slug: string } | null>(null);
  const slug = pageState?.slug ?? routeSlug;
  const page = pageState?.slug === routeSlug ? pageState.page : null;
  const markdownComponents = createMarkdownComponents(
    page?.galleries ?? {},
    page?.assetBase,
    page?.profileRoot,
  );
  const pageAlign = page?.frontmatter.align ?? "top";
  const isHomePage = slug === "home";
  const footerPrefix = isHomePage ? "See nomo on" : "Created with";
  const footerLabel = isHomePage ? "github" : "nomo";
  const footerHref = isHomePage ? "https://github.com/adnfng/nomo" : "https://nomo.md";

  useEffect(() => {
    let cancelled = false;

    loadPageContent(location.pathname).then((next) => {
      if (cancelled) {
        return;
      }

      setPageState(next);
    });

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  usePagePresentation(page);

  return (
    <main className={`app-shell app-shell--${pageAlign}`}>
      <div className="page-wrap">
        <div className="page-content">
          <article className="markdown">
            {page ? (
              <ReactMarkdown
                components={markdownComponents}
                remarkPlugins={markdownRemarkPlugins}
              >
                {page.content}
              </ReactMarkdown>
            ) : null}
          </article>
        </div>
        <footer className="app-footer">
          <span className="markdown-muted">{footerPrefix}</span>{" "}
          <a
            className="markdown-link"
            href={footerHref}
            rel="noreferrer"
            target="_blank"
          >
            <span className="markdown-link__label">{footerLabel}</span>
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
          </a>
          {!isHomePage ? "." : null}
        </footer>
      </div>
    </main>
  );
}

export default App;
