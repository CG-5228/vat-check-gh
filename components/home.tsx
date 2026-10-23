'use client';
import MerchantSearch from './search/merchant-search';
import { useLanguage } from '@/lib/i18n';
import { Source } from './ui/source';
export default function Home() {
  const { locale } = useLanguage();
  return (
    <div className="page-container instrument">
      <h1 className="sr-only">Check Ghana digital VAT for a service</h1>
      <MerchantSearch />
      <div className="empty-state">
        <p>
          {locale === 'tw'
            ? 'Hwehwɛ dwumadie bi anaa adetɔnfoɔ din.'
            : 'Search a service or the seller on your receipt.'}
        </p>
        <p>
          Check its place on GRA’s registered merchant list. Registration alone does not confirm
          that a price includes tax.
        </p>
        <Source questions="14–15" />
      </div>
      <noscript>
        <p>
          Interactive search needs JavaScript. Static results are available for{' '}
          <a href="/check/netflix/">Netflix</a>, <a href="/check/chatgpt/">ChatGPT</a> and{' '}
          <a href="/check/spotify/">Spotify</a>.
        </p>
      </noscript>
    </div>
  );
}
