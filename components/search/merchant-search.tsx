'use client';
import { useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage, TranslatedText } from '@/lib/i18n';
import { searchMerchants, popularMerchants } from '@/lib/merchants';
import { resolveAlias } from '@/lib/aliases';
import { MERCHANT_ISSUE_URL } from '@/lib/seo';
import { Source } from '@/components/ui/source';
export default function MerchantSearch() {
  const { t, locale } = useLanguage();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const id = useId();
  const ambiguous = resolveAlias(query).length > 1;
  const results = query.trim() ? searchMerchants(query).slice(0, 7) : popularMerchants.slice(0, 5);
  function update(value: string) {
    setQuery(value);
    setActive(-1);
    setOpen(true);
    setError('');
  }
  function select(slug: string) {
    setLoading(true);
    try {
      router.push(`/check/${slug}/`);
    } catch {
      setLoading(false);
      setError('The result could not be opened. Try again, or check the official list.');
    }
  }
  return (
    <div className="search-area">
      <label className="sr-only" htmlFor={id}>
        <TranslatedText id="searchLabel" />
      </label>
      <div className="search-field">
        <input
          id={id}
          type="search"
          lang={locale}
          autoComplete="off"
          placeholder={t.searchPlaceholder}
          value={query}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-describedby={`${id}-status`}
          aria-activedescendant={open && active >= 0 ? `${id}-${active}` : undefined}
          onChange={(e) => update(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setOpen(true);
              setActive((i) => Math.min(i + 1, results.length - 1));
            }
            if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActive((i) =>
                results.length ? (i < 0 ? results.length - 1 : Math.max(0, i - 1)) : -1,
              );
            }
            if (e.key === 'Escape') {
              e.preventDefault();
              setOpen(false);
            }
            if (e.key === 'Enter' && results.length) {
              e.preventDefault();
              if (ambiguous && active < 0) return;
              const match = results[Math.max(active, 0)];
              if (match) select(match.slug);
            }
          }}
        />
        {query && (
          <button className="text-button" aria-label="Clear search" onClick={() => update('')}>
            Clear
          </button>
        )}
      </div>
      <div id={`${id}-status`} role="status" aria-live="polite">
        {loading && <p className="help">Opening result…</p>}
        {error && <p className="error">{error}</p>}
      </div>
      {open && (
        <div className="search-results">
          <div className="search-results-heading">
            {ambiguous
              ? 'Choose the legal entity on your receipt.'
              : query.trim()
                ? 'Matching records'
                : 'Try a service'}
          </div>
          <div id={`${id}-list`} role="listbox" aria-label="Matching merchants">
            {results.map((m, i) => (
              <div
                key={m.slug}
                id={`${id}-${i}`}
                role="option"
                aria-selected={i === active}
                className={`search-option ${i === active ? 'selected' : ''}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => select(m.slug)}
              >
                <strong>{m.tradingNames[0] ?? m.legalName}</strong>
                <small>{m.legalName}</small>
              </div>
            ))}
          </div>
          {!results.length && (
            <div className="no-results" role="status">
              <h2>
                <TranslatedText id="noMatch" />
              </h2>
              <p>
                <TranslatedText id="noMatchText" />
              </p>
              <Source questions="13–16" />
              {query.trim().toLowerCase() === 'canva' && (
                <Link href="/check/canva/">View the Canva result</Link>
              )}
              <a href={MERCHANT_ISSUE_URL}>Report a missing merchant</a>
            </div>
          )}
          <button className="text-button" onClick={() => setOpen(false)}>
            Close results
          </button>
        </div>
      )}
    </div>
  );
}
