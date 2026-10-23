import { Source } from '@/components/ui/source';
import { faqItems } from '@/lib/faq';
import { pageMetadata, FAQ_URL } from '@/lib/seo';
import { verifiedAtLabel } from '@/lib/source';

export const metadata = pageMetadata(
  'Digital VAT questions, answered',
  '/faq/',
  'Plain-language answers about Ghana digital VAT, linked to specific GRA guidance.',
);

export default function Page() {
  const structured = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
  return (
    <div className="page-container">
      <h1>Questions about digital VAT</h1>
      <p>
        These answers follow the <a href={FAQ_URL}>GRA approved FAQ</a>, reviewed on{' '}
        {verifiedAtLabel}. Calculation and translation assumptions are explained on the{' '}
        <a href="/about/">About page</a>.
      </p>
      {faqItems.map((item, i) => (
        <article key={item.q}>
          <h2>{item.q}</h2>
          <p>{item.a}</p>
          <Source questions={item.refs} page={item.page} />
          {item.extraRef && (
            <>
              {' '}
              <Source questions={item.extraRef.refs} page={item.extraRef.page} />
            </>
          )}
          {i === 2 && (
            <p>
              <a href="https://gra.gov.gh/domestic-tax/tax-types/vat/">
                GRA VAT guidance: rates, reforms and calculation base
              </a>
            </p>
          )}
          {[5, 6, 7, 8].includes(i) && (
            <p className="help">
              Comparing documents is a practical suggestion. It is not a separate GRA refund
              procedure.
            </p>
          )}
        </article>
      ))}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, '\\u003c') }}
      />
    </div>
  );
}
