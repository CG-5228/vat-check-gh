import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="not-found">
      <p className="eyebrow">LET’S FIND YOUR WAY BACK</p>
      <h1>That page isn’t here.</h1>
      <p className="help">Search for a service, or open one of the tools.</p>
      <Link href="/" className="button">
        Check a service →
      </Link>
    </div>
  );
}
