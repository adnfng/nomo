import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link, useLocation } from "react-router-dom";

type PageMap = Record<string, string>;

const pageModules = import.meta.glob("/pages/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as PageMap;

function buildPages(modules: PageMap): Map<string, string> {
  const pages = new Map<string, string>();

  for (const [filePath, raw] of Object.entries(modules)) {
    const match = filePath.match(/\/([^/]+)\.md$/);
    const fileName = match?.[1]?.toLowerCase();
    if (!fileName) continue;
    pages.set(fileName, raw);
  }

  return pages;
}

const pages = buildPages(pageModules);

function resolveSlug(pathname: string): string {
  const clean = pathname.replace(/^\/+|\/+$/g, "").toLowerCase();
  return clean || "home";
}

function getPageContent(pathname: string): { slug: string; content: string | null } {
  const slug = resolveSlug(pathname);
  const content = pages.get(slug) ?? null;
  return { slug, content };
}

function App() {
  const location = useLocation();
  const { slug, content } = getPageContent(location.pathname);

  return (
    <main className="app-shell">
      <div className="page-wrap">
        <header className="page-header">
          <Link to="/" className="home-link">
            Nomo
          </Link>
        </header>

        <article className="markdown">
          {content ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          ) : (
            <>
              <h1>Page Not Found</h1>
              <p>No markdown file exists for <code>{slug}</code>.</p>
              <p>Create <code>pages/{slug}.md</code> and refresh.</p>
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
