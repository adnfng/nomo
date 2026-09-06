import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Footer } from './components/Footer';
import { ProfileHeader } from './components/ProfileHeader';
import { usePage } from './lib/content/usePage';
import type { PageResult } from './lib/content/resolver';
import type { PageRecord } from './lib/content/types';
import { Markdown } from './lib/markdown/Markdown';
import { usePagePresentation } from './lib/theme/pagePresentation';

function App() {
  const { pathname } = useLocation();
  const { result, loading, retry } = usePage(pathname);
  const page = result?.page ?? null;
  usePagePresentation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return <main className="app-shell" data-layout="portfolio">
    <div className="page-wrap">
      <div className="page-content">
        {page && <ProfileHeader page={page} />}
        <PageBody page={page} result={result} loading={loading} retry={retry} />
      </div>
      <Footer />
    </div>
  </main>;
}
function PageBody({ page, result, loading, retry }: { page: PageRecord | null; result?: PageResult; loading: boolean; retry: () => void }) {
  return <article className="markdown" aria-busy={!result}>
    {result?.status === 'error' ? <div role="alert"><p>This page couldn’t be loaded. Please try again.</p><button className="retry-button" type="button" onClick={retry}>Try again</button></div> : page && <Markdown page={page} />}
    {loading && <p role="status" className="markdown-muted">Loading…</p>}
  </article>;
}
export default App;
