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

  usePagePresentation(page);

  return (
    <main className="app-shell">
      <div className="page-wrap">
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
    </main>
  );
}

export default App;
