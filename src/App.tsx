import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Footer } from './components/Footer';
import { ProfileHeader } from './components/ProfileHeader';
import { ThemeToggle } from './components/ThemeToggle';
import { emptyStats, fillStats } from './lib/analytics/store';
import { loadStats, trackPage } from './lib/analytics/track';
import { isAnalyticsPath, isNativeSite, matchRoute } from './lib/content/routes';
import { usePage } from './lib/content/usePage';
import type { PageResult } from './lib/content/resolver';
import type { PageRecord } from './lib/content/types';
import { Markdown } from './lib/markdown/Markdown';
import { usePagePresentation } from './lib/theme/pagePresentation';

function App() {
  const { pathname } = useLocation();
  const { result, loading, retry } = usePage(pathname);
  const page = result?.page ?? null;
  const { theme, toggle } = usePagePresentation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  useEffect(() => { if (result) trackReady(pathname, result); }, [pathname, result]);
  return <main className="app-shell" data-layout="portfolio">
    <div className="page-wrap">
      <div className="page-content">
        {page && <ProfileHeader page={page} />}
        <PageBody page={page} pathname={pathname} result={result} loading={loading} retry={retry} />
      </div>
      <Footer native={isNativeSite(pathname)} />
    </div>
    <ThemeToggle theme={theme} onToggle={toggle} />
  </main>;
}

function trackReady(pathname: string, result: PageResult) {
  if (result.status === 'error') return;
  const route = matchRoute(pathname);
  const profile = result.status === 'ready' && (route.type === 'profile-root' || route.type === 'profile-content')
    ? route.username
    : undefined;
  trackPage(pathname, profile);
}

function PageBody({ page, pathname, result, loading, retry }: { page: PageRecord | null; pathname: string; result?: PageResult; loading: boolean; retry: () => void }) {
  const content = useFilledContent(pathname, page);
  return <article className={isAnalyticsPath(pathname) ? 'markdown analytics' : 'markdown'} aria-busy={!result}>
    {result?.status === 'error' ? <div role="alert"><p>This page couldn’t be loaded. Please try again.</p><button className="retry-button" type="button" onClick={retry}>Try again</button></div> : page && <Markdown page={page} content={content} />}
    {loading && <p role="status" className="markdown-muted">Loading…</p>}
  </article>;
}

function useFilledContent(pathname: string, page: PageRecord | null) {
  const [stats, setStats] = useState(emptyStats);
  useEffect(() => {
    if (!isAnalyticsPath(pathname)) return;
    void loadStats().then(setStats);
  }, [pathname]);
  if (!page) return undefined;
  return isAnalyticsPath(pathname) ? fillStats(page.content, stats) : page.content;
}

export default App;
