import ReactMarkdown from "react-markdown";
import { Link, useLocation } from "react-router-dom";

import { getPageContent } from "./lib/content/pages";
import { createMarkdownComponents } from "./lib/markdown/components";
import { markdownRemarkPlugins } from "./lib/markdown/plugins";
import { usePagePresentation } from "./lib/theme/pagePresentation";

function App() {
  const location = useLocation();
  const { slug, page } = getPageContent(location.pathname);
  const markdownComponents = createMarkdownComponents(page?.galleries ?? {});
  const pageAlign = page?.frontmatter.align ?? "top";

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
            ) : (
              <>
                <h1>Page Not Found</h1>
                <p>
                  No markdown file exists for <code>{slug}</code>.
                </p>
                <p>
                  Create <code>pages/{slug}.md</code> and refresh.
                </p>
                <p>
                  <Link to="/">Back home</Link>
                </p>
              </>
            )}
          </article>
        </div>
        <footer className="app-footer">
          <span className="markdown-muted">Created with</span>{" "}
          <a
            className="markdown-link"
            href="https://nomo.md"
            rel="noreferrer"
            target="_blank"
          >
            <span className="markdown-link__label">nomo</span>
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
          .
        </footer>
      </div>
    </main>
  );
}

export default App;
