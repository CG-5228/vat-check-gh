import { sourceMeta, merchants } from '@/lib/merchants';
import { pageMetadata, GRA_URL, REPOSITORY_URL, MERCHANT_ISSUE_URL } from '@/lib/seo';
import { sourceDateLabel, verifiedAtLabel, ratesEffectiveLabel } from '@/lib/source';
import { Source } from '@/components/ui/source';

export const metadata = pageMetadata(
  'About VAT Check GH',
  '/about/',
  'Our sources, data freshness, assumptions and approach to privacy.',
);

export default function Page() {
  return (
    <div className="page-container">
      <h1>About</h1>
      <p>
        VAT Check GH helps people in Ghana check the published merchant list, estimate digital
        service tax and query a charge. It is free and independent. Your entries stay in your
        browser. There are no accounts, advertisements or trackers.
      </p>

      <h2>What the list tells you</h2>
      <p>
        The official snapshot contains {merchants.length} registered merchant records and is dated{' '}
        {sourceDateLabel}. It confirms which legal entities appear in that snapshot. Check the legal
        name on your receipt to identify the seller for your purchase.
      </p>
      <p>
        Registration alone does not establish whether your invoice includes tax or whether a
        particular purchase qualifies. GRA’s FAQ includes both registered and unregistered foreign
        digital suppliers. Registered providers should show prices before VAT, with tax collected at
        payment.
      </p>
      <Source questions="13–15" />

      <h2>Sources</h2>
      <p>
        <a href={sourceMeta.merchantsPdfUrl}>GRA registered non-resident merchants list</a>:{' '}
        {merchants.length} records across four pages, dated {sourceDateLabel}. A script downloads
        and extracts the document. The date comes from the official filename.
      </p>
      <p>
        Original PDF SHA-256: <code className="mono">{sourceMeta.merchantsPdfSha256}</code>
      </p>
      <p>
        <a href={sourceMeta.faqUrl}>GRA approved RTVAT FAQ</a>: three pages. The document is undated
        and is hosted in GRA’s October 2026 uploads folder. Questions 9 and 11–15 cover the combined
        rate, eligibility, wrong charges and registered suppliers.
      </p>
      <p>
        <a href={sourceMeta.ratesUrl}>GRA VAT rates and 2026 reforms</a>: VAT 15%, NHIL 2.5% and
        GETFund 2.5%, all on the same base from {ratesEffectiveLabel}.
      </p>
      <p>
        <a href={GRA_URL}>GRA RTVAT overview</a>: the transactions and payment providers covered by
        the collection framework.
      </p>
      <p>
        <a href={sourceMeta.kpmgUrl}>KPMG summary, 21 October 2026</a>: secondary context on the
        October introduction and unresolved implementation details. Official GRA guidance takes
        priority.
      </p>

      <h2>Limits and assumptions</h2>
      <p>
        The calculator assumes half-up rounding to a pesewa and allocates component rounding to
        preserve the total. GRA’s reviewed guidance does not prescribe the provider’s pesewa
        rounding. Brand aliases are manually reviewed and only point to legal entities present in
        the snapshot.
      </p>
      <p>
        Two amounts alone cannot confirm duplicate tax. Currency conversion, fees, separate tax
        debits and merchant billing practices may affect a statement. The charge helper produces a
        draft message for you to review. It does not send the message or promise a refund.
      </p>
      <p>
        If wrongly collected VAT is not refunded automatically, the FAQ says to notify the bank or
        electronic money issuer used for payment. It gives no refund deadline.
      </p>
      <Source questions="12" />

      <h2>Draft Twi</h2>
      <p>
        English is complete. Key interface text and outcome headings have draft Twi translations
        that need native-speaker review. Some detailed guidance remains in English. Changing
        language keeps your current entries and step.
      </p>

      <h2 id="contribute">Contribute</h2>
      <p>
        <a href={MERCHANT_ISSUE_URL}>Report a missing merchant</a>,{' '}
        <a href={`${REPOSITORY_URL}/issues/new?template=new-alias.md`}>suggest an alias</a>, or{' '}
        <a href={`${REPOSITORY_URL}/issues/new`}>report a translation correction</a>. Include the
        exact legal entity and relevant official source page. You can also{' '}
        <a href={REPOSITORY_URL}>read the source code</a>.
      </p>
      <p>
        The source package includes data-refresh instructions, tests, an MIT license and
        contribution guidelines. Keep card numbers, account details and private statements out of
        public reports.
      </p>
      <p>
        Not affiliated with GRA. Not tax or legal advice. Check official GRA guidance. Sources were
        reviewed on {verifiedAtLabel}. Recheck the official documents before relying on the
        snapshot.
      </p>
    </div>
  );
}
