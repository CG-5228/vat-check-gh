import { PageIntro } from '@/components/ui/shell';
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
      <PageIntro
        eyebrow="OFFICIAL GUIDANCE, IN EVERYDAY WORDS"
        title="Good questions. Clearer answers."
        description="Understand the rules behind a payment, with a source you can check for yourself."
      />
      <div className="faq-layout">
        <aside className="faq-sidebar">
          <strong>START WITH THE SOURCE</strong>
          <p>
            These explanations follow GRA’s approved FAQ, reviewed on {verifiedAtLabel}. Where
            details are unclear, we say so.
          </p>
          <a className="source-link" href={FAQ_URL}>
            Read the complete GRA FAQ ↗
          </a>
          <p>Translation and calculation choices are documented as assumptions.</p>
        </aside>
        <div>
          {faqItems.map((item, i) => (
            <article className="faq-item" key={item.q}>
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
                <>
                  <br />
                  <a className="source-link" href="https://gra.gov.gh/domestic-tax/tax-types/vat/">
                    GRA VAT guidance · rates, reforms and base ↗
                  </a>
                </>
              )}
              {[5, 6, 7, 8].includes(i) && (
                <p className="help">
                  The advice to compare documents is a practical suggestion. It is not a separate
                  GRA refund procedure.
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, '\\u003c') }}
      />
    </div>
  );
}
