'use client';
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="page-container">
      <h1>This page could not load.</h1>
      <p>Your entries have not been sent anywhere. Try loading the page again.</p>
      <button className="button button-light" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
