import Link from 'next/link';
import { notFound } from 'next/navigation';
import { merchants, getMerchant, merchantName, sourceMeta } from '@/lib/merchants';
import { SITE_URL, pageMetadata, MERCHANT_ISSUE_URL } from '@/lib/seo';
import { sourceDateLabel, verifiedAtLabel } from '@/lib/source';
import { Source } from '@/components/ui/source';
import ShareCard from '@/components/share/share-card';
import ResultMeaning from '@/components/result/result-meaning';

export const dynamicParams = false;
export function generateStaticParams() {
  return [...merchants.map((m) => ({ slug: m.slug })), { slug: 'canva' }];
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = getMerchant(slug);
  const name = m ? merchantName(m) : slug === 'canva' ? 'Canva' : 'Merchant';
  const meta = pageMetadata(
    `${name}: Ghana digital VAT`,
    `/check/${slug}/`,
    `${name}: ${m ? 'on GRA’s registered merchant list' : 'not found on this list'} as of ${sourceDateLabel}. Check what this means for your payment.`,
  );
  return {
    ...meta,
    openGraph: { ...meta.openGraph, images: [`${SITE_URL}/check/${slug}/og.png`] },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = getMerchant(slug);
  if (!m && slug !== 'canva') notFound();
  const name = m ? merchantName(m) : 'Canva';

  return (
    <div className="page-container">
      <h1>{name}</h1>
      <p>
        {m ? 'On the GRA list' : 'Not on this GRA list'} as of {sourceDateLabel}.
      </p>
      <p>
        {m
          ? `Listed legal entity: ${m.legalName}`
          : `The name Canva was not found among the ${merchants.length} published entries. A different billing entity may appear on your receipt.`}
      </p>
      {m ? (
        <ResultMeaning />
      ) : (
        <p>
          Your bank or MoMo may add tax at payment if the transaction qualifies. Absence from this
          dated list does not establish an exemption.
        </p>
      )}
      <Source questions="14–15" />
      <p>
        RTVAT applies when the supplier is outside Ghana, the service is delivered electronically
        and the payment instrument is issued in Ghana. Registration alone cannot establish whether
        your purchase meets these conditions.
      </p>
      <Source questions="11, 13" />
      <p>
        <Link href="/apply/">Check whether your payment qualifies</Link>
      </p>

      <h2>Example payment</h2>
      <p>For a qualifying digital service priced at GH₵100.00 before tax:</p>
      <p>Total you pay</p>
      <p className="result-figure">GH₵120.00</p>
      <table className="breakdown">
        <caption className="sr-only">Example Ghana tax breakdown</caption>
        <tbody>
          <tr>
            <th scope="row">Price before tax</th>
            <td>GH₵100.00</td>
          </tr>
          <tr>
            <th scope="row">VAT (15%)</th>
            <td>GH₵15.00</td>
          </tr>
          <tr>
            <th scope="row">NHIL (2.5%)</th>
            <td>GH₵2.50</td>
          </tr>
          <tr>
            <th scope="row">GETFund (2.5%)</th>
            <td>GH₵2.50</td>
          </tr>
          <tr>
            <th scope="row">Total tax (20%)</th>
            <td>GH₵20.00</td>
          </tr>
          <tr>
            <th scope="row">Total</th>
            <td>GH₵120.00</td>
          </tr>
        </tbody>
      </table>
      <p>
        VAT and both levies use the same price before tax.{' '}
        <a href={sourceMeta.ratesUrl}>GRA VAT rates and calculation base</a>.
      </p>
      <Source questions="9" />
      <p>
        <Link href="/calculator/">Calculate your own amount</Link>
      </p>

      <h2>Query a charge</h2>
      <p>
        Check the legal seller and tax breakdown on your receipt. Compare the receipt with your
        settled statement, including related tax debits. If wrongly collected VAT is not refunded
        automatically, notify the bank or electronic money issuer you paid through.
      </p>
      <Source questions="12" />
      <p>
        <Link href="/double-charge/">Compare a receipt and statement</Link>
      </p>
      <ShareCard name={name} registered={!!m} />

      <h2>Source</h2>
      <p>
        {m ? (
          <>
            GRA registered non-resident merchants list, page {m.sourcePage}.{' '}
            <a href={`${m.sourceUrl}#page=${m.sourcePage}`}>Read the original entry</a>.
          </>
        ) : (
          <>
            Name checked against all {merchants.length} entries.{' '}
            <a href={sourceMeta.merchantsPdfUrl}>Read the official merchant list</a>.
          </>
        )}
      </p>
      <p>
        List dated {sourceDateLabel}. Guidance checked {verifiedAtLabel}. This snapshot cannot
        establish how a particular payment was taxed.
      </p>
      <p>
        <a href={MERCHANT_ISSUE_URL}>Report a missing merchant or incorrect name</a>
      </p>
    </div>
  );
}
