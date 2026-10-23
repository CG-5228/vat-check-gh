'use client';
import { useState } from 'react';
import { ReceiptText, Copy, CircleHelp } from 'lucide-react';
import { assessCharge, complaintMessage } from '@/lib/double-charge';
import { parseMoney, formatMoney, pesewas } from '@/lib/money';
import { PageIntro } from './ui/shell';
import { Source } from './ui/source';
import { useLanguage } from '@/lib/i18n';
export default function DoubleCharge() {
  const { t } = useLanguage();
  const [merchant, setMerchant] = useState('');
  const [statement, setStatement] = useState('');
  const [included, setIncluded] = useState<boolean | 'unknown'>('unknown');
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [copied, setCopied] = useState('');
  const a = parseMoney(merchant),
    b = parseMoney(statement);
  const result =
    a.value !== null && b.value !== null
      ? assessCharge({
          merchantAmount: a.value,
          statementAmount: b.value,
          merchantIncludesTax: included,
        })
      : null;
  const message =
    a.value !== null && b.value !== null
      ? complaintMessage({
          merchantAmount: a.value,
          statementAmount: b.value,
          merchantName: name || undefined,
          paymentDate: date || undefined,
        })
      : '';
  return (
    <div className="page-container">
      <PageIntro
        eyebrow="CHECK THE DIFFERENCE"
        title={t.chargeTitle}
        description={t.chargeSubtitle}
      />
      <div className="two-col">
        <section className="panel">
          <div className="text-field">
            <label className="field-label" htmlFor="merchant-amount">
              Merchant charged (GHS)
            </label>
            <p className="field-help" id="merchant-help">
              Enter the final GHS total on the merchant receipt.
            </p>
            <div className="money-input-wrap">
              <span>GHS</span>
              <input
                className="input"
                id="merchant-amount"
                inputMode="decimal"
                value={merchant}
                onChange={(e) => {
                  setMerchant(e.target.value);
                  setCopied('');
                }}
                aria-describedby="merchant-help merchant-error"
                aria-invalid={!!merchant && !!a.error}
              />
            </div>
            <p className="error" role="status" id="merchant-error">
              {merchant ? a.error : null}
            </p>
          </div>
          <div className="text-field">
            <label className="field-label" htmlFor="statement-amount">
              Statement shows (GHS)
            </label>
            <div className="money-input-wrap">
              <span>GHS</span>
              <input
                className="input"
                id="statement-amount"
                inputMode="decimal"
                value={statement}
                onChange={(e) => {
                  setStatement(e.target.value);
                  setCopied('');
                }}
                aria-describedby="statement-help statement-error"
                aria-invalid={!!statement && !!b.error}
              />
            </div>
            <p id="statement-help" className="field-help">
              Use the same transaction. Include related tax debits. Foreign currency conversion and
              fees can change the amount.
            </p>
            <p className="error" role="status" id="statement-error">
              {statement ? b.error : null}
            </p>
          </div>
          <fieldset>
            <legend className="field-label">
              Does the receipt show Ghana VAT already charged?
            </legend>
            <div className="choice-list">
              {(
                [
                  { v: true, label: 'Yes, the receipt clearly shows Ghana tax' },
                  { v: false, label: 'No, the receipt shows a price before Ghana tax' },
                  { v: 'unknown', label: 'I’m not sure' },
                ] as const
              ).map((x) => (
                <label key={String(x.v)} className="choice">
                  <input
                    type="radio"
                    name="merchant-tax"
                    checked={included === x.v}
                    onChange={() => setIncluded(x.v)}
                  />
                  {x.label}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="charge-extra">
            <label className="field-label" htmlFor="merchant-name">
              Merchant name (optional)
            </label>
            <input
              className="input"
              id="merchant-name"
              value={name}
              maxLength={120}
              onChange={(e) => setName(e.target.value)}
            />
            <label className="field-label" htmlFor="payment-date" style={{ marginTop: 19 }}>
              Payment date (optional)
            </label>
            <input
              className="input"
              id="payment-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </section>
        <div>
          <section className="panel estimate-panel" aria-live="polite">
            {result ? (
              <div className="charge-result">
                <span
                  className={`status-badge ${result.verdict === 'possible-duplicate' ? 'warning' : ''}`}
                >
                  <CircleHelp size={15} />A guide, not a final verdict
                </span>
                <h2>{result.title}</h2>
                <p>{result.explanation}</p>
                <div className="grand-total">
                  <span>Difference</span>
                  <strong>
                    {result.difference < 0 ? '−' : ''}
                    {formatMoney(pesewas(Math.abs(result.difference)))}
                  </strong>
                </div>
                <Source questions="9, 12, 15" />
              </div>
            ) : (
              <div className="empty-state">
                <ReceiptText size={35} />
                <h2>Let’s compare the two amounts.</h2>
                <p>
                  Enter both GHS amounts to see what the difference could mean. Your entries stay in
                  your browser.
                </p>
              </div>
            )}
          </section>
          <div className="notice">
            <strong>If VAT was wrongly charged</strong>
            <br />
            GRA says a refund may happen automatically. If it does not, notify the bank or
            electronic money issuer you paid through. The FAQ gives no guaranteed refund timeframe.
            <br />
            <Source questions="12" />
          </div>
        </div>
      </div>
      {result && (
        <section className="panel" style={{ marginTop: 24 }}>
          <h2 className="small-title">A MESSAGE YOU CAN USE</h2>
          <p className="help">
            Review this draft, then add the transaction reference through your provider’s secure
            support channel. No message is sent by this site.
          </p>
          <label className="sr-only" htmlFor="complaint">
            Message to your payment provider
          </label>
          <textarea className="message-area" id="complaint" value={message} readOnly />
          <button
            className="button"
            style={{ marginTop: 16 }}
            onClick={() => {
              void navigator.clipboard
                .writeText(message)
                .then(() => setCopied('Message copied'))
                .catch(() => setCopied('Select the message above and copy it manually.'));
            }}
          >
            <Copy size={16} />
            Copy message
          </button>
          <p className="copy-status" role="status">
            {copied}
          </p>
        </section>
      )}
    </div>
  );
}
