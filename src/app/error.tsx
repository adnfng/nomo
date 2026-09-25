"use client";

export default function PageError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <div className="page-wrap">
    <div className="page-content">
      <article className="markdown" role="alert">
        <p>This page couldn’t be loaded. GitHub may be slow right now.</p>
        <p><button className="retry-button" type="button" onClick={() => retry()}>Try again</button></p>
      </article>
    </div>
  </div>;
}
