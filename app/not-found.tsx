import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="not-found">
      <h1>Page not found</h1>
      <p>Search for a service or choose a tool below.</p>
      <Link href="/" className="button button-light">
        Check a service
      </Link>
    </div>
  );
}
