import { useEffect, useState } from 'react';
import { loadPageContent } from './pages';
import type { PageResult } from './resolver';

export function usePage(pathname: string) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ pathname: string; attempt: number; result: PageResult }>();
  const [loading, setLoading] = useState(false);
  const result = state?.pathname === pathname && state.attempt === attempt ? state.result : undefined;
  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => { if (!cancelled) setLoading(true); }, 350);
    void loadPageContent(pathname).then(next => {
      if (cancelled) return;
      window.clearTimeout(timer);
      setLoading(false);
      setState({ pathname, attempt, result: next });
    });
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [pathname, attempt]);
  return { result, loading: !result && loading, retry: () => setAttempt(value => value + 1) };
}
