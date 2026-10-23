import { PageIntro } from '@/components/ui/shell';
import { sourceMeta, merchants } from '@/lib/merchants';
import { pageMetadata, GRA_URL } from '@/lib/seo';
import { sourceDateLabel, verifiedAtLabel, ratesEffectiveLabel } from '@/lib/source';
export const metadata = pageMetadata(
  'About this independent project',
  '/about/',
  'Our sources, data freshness, assumptions and approach to privacy.',
);
export default function Page() {
  return (
    <div className="page-container">
      <PageIntro
        eyebrow="INDEPENDENT BY DESIGN"
        title="Your money deserves a clear explanation."
        description="VAT Check GH is a free, open-source guide for people in Ghana paying for foreign digital services."
      />
      <div className="prose">
        <p>
          We turn published guidance into small tools you can use: a merchant search, a
          three-question check, an exact-pesewa calculator and a charge comparison. There are no
          accounts, advertisements or trackers. Entries stay in your browser.
        </p>
        <h2>What the list can tell you</h2>
        <p>
          The official snapshot contains {merchants.length} registered merchant records. It is dated{' '}
          {sourceDateLabel}. A name being on this list confirms its presence in that snapshot. It
          does not tell us how your invoice was prepared, whether a particular service is taxable,
          or whether your payment provider collected the correct amount.
        </p>
        <div className="notice">
          <strong>A correction that matters</strong>
          <br />
          Registration does not mean tax is included in a displayed price. The approved GRA FAQ,
          page 2, questions 14–15, includes registered merchants and says prices should be shown
          before VAT, with tax charged at payment.
        </div>
        <h2>Follow the evidence</h2>
        <div className="source-record">
          <strong>
            <a href={sourceMeta.merchantsPdfUrl}>Registered non-resident merchants list ↗</a>
          </strong>
          <p>
            {merchants.length} records across four pages. Snapshot dated {sourceDateLabel}. A
            repeatable script downloads and extracts this document.
          </p>
          <small>Original PDF SHA-256</small>
          <small className="mono">{sourceMeta.merchantsPdfSha256}</small>
        </div>
        <div className="source-record">
          <strong>
            <a href={sourceMeta.faqUrl}>GRA approved RTVAT FAQ ↗</a>
          </strong>
          <p>
            Undated approved FAQ, three pages, hosted in GRA’s October 2026 uploads folder.
            Questions 9, 11–15 explain rates, eligibility, wrong charges and registered merchants.
          </p>
        </div>
        <div className="source-record">
          <strong>
            <a href="https://gra.gov.gh/domestic-tax/tax-types/vat/">
              GRA VAT rates and 2026 reforms ↗
            </a>
          </strong>
          <p>
            Confirms VAT 15%, NHIL 2.5%, GETFund 2.5%, all on the same base from{' '}
            {ratesEffectiveLabel}.
          </p>
        </div>
        <div className="source-record">
          <strong>
            <a href={GRA_URL}>GRA RTVAT overview ↗</a>
          </strong>
          <p>Explains the scope and payment providers covered by the collection framework.</p>
        </div>
        <div className="source-record">
          <strong>
            <a href={sourceMeta.kpmgUrl}>KPMG summary, 21 October 2026 ↗</a>
          </strong>
          <p>
            Secondary context on the October introduction and unresolved implementation details.
            Official GRA guidance takes priority.
          </p>
        </div>
        <h2>What we cannot establish</h2>
        <p>
          A simple comparison cannot confirm duplicate tax. Currency conversion, provider fees,
          separate tax debits and merchant billing practices can affect what appears on your
          statement. Our helper suggests questions and generates a draft message. It never sends one
          or promises a refund.
        </p>
        <p>
          The calculator assumes half-up rounding to a pesewa and allocates component rounding to
          preserve the total. GRA’s supplied guidance does not prescribe the provider’s pesewa
          rounding. The PDF filename supplies the list date. Brand aliases are manually reviewed and
          only point to legal entities present in the snapshot.
        </p>
        <h2>English and draft Twi</h2>
        <p>
          English is complete. Key interface text and outcome headings have draft Twi translations
          that need native-speaker review. Some detailed guidance remains in English. Changing
          language keeps your current entries and step.
        </p>
        <h2 id="contribute">Help keep the details right</h2>
        <p>
          To report a missing merchant, suggest an alias or correct a translation, use the issue
          templates in the source package. Include the exact legal entity and the relevant official
          page. A public GitHub repository has not been configured for this copy, so there is no
          live issue form yet.
        </p>
        <p>
          The source package includes data-refresh instructions, tests, an MIT license and
          contribution guidelines. Never include card numbers, account details or private statements
          in a public report.
        </p>
        <h2>A note on independence</h2>
        <p>
          Not affiliated with GRA. Not tax or legal advice. Check official GRA guidance. Source
          guidance was reviewed on {verifiedAtLabel}. Recheck the official documents before relying
          on the snapshot.
        </p>
      </div>
    </div>
  );
}
