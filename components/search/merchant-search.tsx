'use client';
import { useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, ArrowRight, CheckCircle2, X } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { searchMerchants, popularMerchants } from '@/lib/merchants';
import { resolveAlias } from '@/lib/aliases';
import { Source } from '@/components/ui/source';
export default function MerchantSearch() {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const router = useRouter();
  const id = useId();
  const ambiguous = resolveAlias(query).length > 1;
  const results = query.trim() ? searchMerchants(query).slice(0, 7) : popularMerchants.slice(0, 5);
  function update(s: string) {
    setQuery(s);
    setActive(-1);
    setOpen(true);
  }
  return (
    <div className="search-area">
      <label className="search-label" htmlFor={id}>
        {t.searchLabel}
      </label>
      <div className={`search-field ${open ? 'search-focused' : ''}`}>
        <Search size={23} aria-hidden="true" />
        <input
          id={id}
          type="search"
          autoComplete="off"
          placeholder={t.searchPlaceholder}
          value={query}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={`${id}-list`}
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
              setActive((i) => Math.max(0, i - 1));
            }
            if (e.key === 'Escape') setOpen(false);
            if (e.key === 'Enter' && results.length) {
              if (ambiguous && active < 0) {
                setOpen(true);
                return;
              }
              e.preventDefault();
              const m = results[Math.max(active, 0)];
              if (m) router.push(`/check/${m.slug}/`);
            }
          }}
        />
        {query ? (
          <button
            type="button"
            className="icon-button clear-search"
            aria-label="Clear search"
            onClick={() => {
              update('');
            }}
          >
            <X size={18} />
          </button>
        ) : (
          <span className="search-key" aria-hidden="true">
            ↵
          </span>
        )}
        <button
          type="button"
          className="search-submit"
          aria-label="Search merchants"
          onClick={() => {
            const m = results[0];
            if (query.trim() && m && !ambiguous) router.push(`/check/${m.slug}/`);
            else setOpen(!open);
          }}
        >
          <ArrowRight size={21} />
        </button>
      </div>
      <p className="search-hint">{t.searchHint}</p>
      {open && (
        <>
          <button
            className="search-dismiss"
            aria-label="Close search suggestions"
            onClick={() => setOpen(false)}
            tabIndex={-1}
          />
          <div
            className="search-results"
            id={`${id}-list`}
            role="listbox"
            aria-label="Matching merchants"
          >
            {ambiguous && (
              <div className="search-chooser-note">
                More than one listed entity. Choose the name on your receipt.
              </div>
            )}
            {results.length ? (
              results.map((m, i) => (
                <div
                  key={m.slug}
                  id={`${id}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  className={`search-option ${i === active ? 'selected' : ''}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => router.push(`/check/${m.slug}/`)}
                >
                  <div>
                    <strong>{m.tradingNames[0] ?? m.aliases[0] ?? m.legalName}</strong>
                    <small>{m.legalName}</small>
                  </div>
                  <CheckCircle2 size={17} />
                </div>
              ))
            ) : (
              <div className="no-results" role="option" aria-selected={false}>
                <strong>{t.noMatch}</strong>
                <p>{t.noMatchText}</p>
                <Source questions="13–16" />
                <Link href="/about/#contribute">Report a missing merchant →</Link>
              </div>
            )}
          </div>
        </>
      )}
      <div className="popular">
        <span>{t.popular}</span>
        <div>
          {popularMerchants.slice(0, 4).map((m) => (
            <Link href={`/check/${m.slug}/`} key={m.slug}>
              {m.slug === 'chatgpt'
                ? 'ChatGPT'
                : m.slug === 'netflix'
                  ? 'Netflix'
                  : m.slug === 'spotify'
                    ? 'Spotify'
                    : (m.tradingNames[0] ?? m.legalName)}
              <ArrowUpIcon />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
function ArrowUpIcon() {
  return <ArrowRight size={12} className="chip-arrow" />;
}
