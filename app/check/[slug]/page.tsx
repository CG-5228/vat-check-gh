import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, Calculator, ArrowRight, CircleHelp } from 'lucide-react';
import { merchants, getMerchant, merchantName, sourceMeta } from '@/lib/merchants';
import { SITE_URL, pageMetadata } from '@/lib/seo';
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
      <div className="result-header">
        <Link href="/" className="back-link">
          ← Check another service
        </Link>
        <br />
        <span className={`status-badge ${!m ? 'warning' : ''}`}>
          {m ? <CheckCircle2 size={15} /> : <CircleHelp size={15} />}{' '}
          {m ? 'On the GRA list' : 'Not on this GRA list'}
        </span>
        <h1 className="result-title">{name}</h1>
        <p className="legal-name">
          {m
            ? `Listed legal entity: ${m.legalName}`
            : 'The name Canva was not found in the published snapshot. This is a list lookup, not an exemption.'}
        </p>
        <Source questions="14–15" />
      </div>
      <div className="result-grid">
        <section className="panel">
          {m ? (
            <ResultMeaning />
          ) : (
            <>
              <h2>Not listed does not mean tax-free.</h2>
              <p>
                Not on GRA’s list as of {sourceDateLabel}. Your bank or MoMo may add tax at payment
                if the transaction qualifies. The list is a dated snapshot and may not include a
                different billing entity.
              </p>
            </>
          )}
          <div className="result-steps">
            <div>
              <span className="step-num">1</span>
              <p>
                <strong>Check the actual seller.</strong>
                <br />
                Read the legal entity on your receipt, especially when paying through an app store.
              </p>
            </div>
            <div>
              <span className="step-num">2</span>
              <p>
                <strong>Look for Ghana tax.</strong>
                <br />A listed merchant can sell different things. The payment must still meet all
                three RTVAT conditions.
              </p>
            </div>
            <div>
              <span className="step-num">3</span>
              <p>
                <strong>Query a charge with evidence.</strong>
                <br />
                If the merchant already charged tax, compare that receipt with your payment
                statement before asking your provider to review it.
              </p>
            </div>
          </div>
          <div className="source-stack">
            <Source questions="13–15" />
            <Source questions="12" />
          </div>
          <div className="share-actions">
            <ShareCard name={name} registered={!!m} />
            <Link className="button" href="/double-charge/">
              Check a charge <ArrowRight size={15} />
            </Link>
          </div>
        </section>
        <aside className="panel estimate-panel">
          <h2>A simple example</h2>
          <p>A qualifying service priced at GH₵100.00 before tax:</p>
          <table className="breakdown">
            <caption className="sr-only">Example Ghana tax breakdown</caption>
            <tbody>
              <tr>
                <th scope="row">Price before tax</th>
                <td>GH₵100.00</td>
              </tr>
              <tr>
                <th scope="row">VAT · 15%</th>
                <td>GH₵15.00</td>
              </tr>
              <tr>
                <th scope="row">NHIL · 2.5%</th>
                <td>GH₵2.50</td>
              </tr>
              <tr>
                <th scope="row">GETFund · 2.5%</th>
                <td>GH₵2.50</td>
              </tr>
            </tbody>
          </table>
          <div className="grand-total">
            <span>Total</span>
            <strong>GH₵120.00</strong>
          </div>
          <Source questions="9" />
          <p className="help">
            <a href="https://gra.gov.gh/domestic-tax/tax-types/vat/">GRA VAT guidance ↗</a> confirms
            that the levies and VAT share the same base. Your receipt and provider’s treatment still
            need to be checked.
          </p>
          <Link href="/calculator/" className="button button-light">
            <Calculator size={15} />
            Use your own amount
          </Link>
        </aside>
      </div>
      <div className="result-source">
        <strong>Trace this result</strong>
        <br />
        {m ? (
          <>
            Official GRA registered non-resident merchants list, page {m.sourcePage}.{' '}
            <a href={`${m.sourceUrl}#page=${m.sourcePage}`}>View the original entry ↗</a>
          </>
        ) : (
          <>
            Name checked against all {merchants.length} entries.{' '}
            <a href={sourceMeta.merchantsPdfUrl}>View the complete official list ↗</a>
          </>
        )}
        <br />
        List dated {sourceDateLabel}. Guidance checked {verifiedAtLabel}. Snapshot status cannot
        prove how a particular payment was taxed.
        <br />
        <Link href="/about/#contribute">Report a missing merchant or incorrect name →</Link>
      </div>
    </div>
  );
}
