'use client';
import { useState } from 'react';
import { assessCharge, complaintMessage } from '@/lib/double-charge';
import { parseMoney, formatMoney, pesewas } from '@/lib/money';
import MoneyFigure from '@/components/ui/money-figure';
import { Source } from './ui/source';
import { useLanguage } from '@/lib/i18n';
export default function DoubleCharge() {
  const { t, locale } = useLanguage();
  const [merchant, setMerchant] = useState('');
  const [statement, setStatement] = useState('');
  const [included, setIncluded] = useState<boolean | 'unknown'>('unknown');
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [copied, setCopied] = useState('');
  const [copying, setCopying] = useState(false);
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
  // ASSUMPTION: These Twi outcome labels are draft translations needing native-speaker review.
  const twiTitles = {
    'possible-duplicate': 'Ebetumi ayɛ toɔ a wɔagye mmienu.',
    'consistent-with-once': 'Ɛne toɔ a wɔagye pɛnkoro hyia.',
    'same-amount': 'Sika no yɛ pɛ.',
    'lower-statement': 'Statement sika no sua.',
    unclear: 'Nsɛm no nnɔɔso.',
  };
  async function copyMessage() {
    setCopying(true);
    setCopied('');
    try {
      await navigator.clipboard.writeText(message);
      setCopied('Message copied');
    } catch {
      setCopied('Select the message below and copy it manually.');
    } finally {
      setCopying(false);
    }
  }
  return (
    <div className="instrument">
      <h1 className="sr-only">{t.doubleCharge}</h1>
      <div className="field">
        <label className="field-label" htmlFor="merchant-amount">
          Merchant charged (GHS)
        </label>
        <input
          className="input"
          id="merchant-amount"
          inputMode="decimal"
          autoComplete="off"
          value={merchant}
          onChange={(e) => {
            setMerchant(e.target.value);
            setCopied('');
          }}
          aria-describedby={`merchant-help${a.error ? ' merchant-error' : ''}`}
          aria-invalid={!!a.error}
        />
        <p className="help" id="merchant-help">
          Enter the final GHS total on the merchant receipt.
        </p>
        {a.error && (
          <p className="error" role="status" id="merchant-error">
            {a.error}
          </p>
        )}
      </div>
      <div className="field">
        <label className="field-label" htmlFor="statement-amount">
          Statement shows (GHS)
        </label>
        <input
          className="input"
          id="statement-amount"
          inputMode="decimal"
          autoComplete="off"
          value={statement}
          onChange={(e) => {
            setStatement(e.target.value);
            setCopied('');
          }}
          aria-describedby={`statement-help${b.error ? ' statement-error' : ''}`}
          aria-invalid={!!b.error}
        />
        <p id="statement-help" className="help">
          Use the same settled transaction and include related tax debits. Enter matching GHS
          amounts; fees and currency conversion can change the difference.
        </p>
        {b.error && (
          <p className="error" role="status" id="statement-error">
            {b.error}
          </p>
        )}
      </div>
      <fieldset className="field">
        <legend className="field-label">Does the receipt show Ghana VAT already charged?</legend>
        {(
          [
            { value: true, label: 'Yes, the receipt clearly shows Ghana tax' },
            { value: false, label: 'No, the receipt shows a price before Ghana tax' },
            { value: 'unknown', label: 'I’m not sure' },
          ] as const
        ).map((option) => (
          <label key={String(option.value)} className="choice">
            <input
              type="radio"
              name="merchant-tax"
              checked={included === option.value}
              onChange={() => {
                setIncluded(option.value);
                setCopied('');
              }}
            />
            {option.label}
          </label>
        ))}
      </fieldset>
      <section aria-live="polite" aria-atomic="true">
        {result ? (
          <>
            <p className="result-figure">
              <MoneyFigure
                amount={pesewas(Math.abs(result.difference))}
                negative={result.difference < 0}
              />
            </p>
            <p>Difference between receipt and statement</p>
            <h2>{locale === 'tw' ? twiTitles[result.verdict] : result.title}</h2>
            <p>{result.explanation}</p>
            <table className="receipt-table">
              <caption className="sr-only">Charge comparison in Ghana cedis</caption>
              <tbody>
                <tr>
                  <th scope="row">Merchant receipt</th>
                  <td>{formatMoney(a.value ?? pesewas(0))}</td>
                </tr>
                <tr>
                  <th scope="row">Statement total</th>
                  <td>{formatMoney(b.value ?? pesewas(0))}</td>
                </tr>
                <tr>
                  <th scope="row">Receipt plus one 20% charge</th>
                  <td>{formatMoney(result.expectedOnce)}</td>
                </tr>
              </tbody>
            </table>
            <p className="help">
              <Source questions="9, 12, 15" />
            </p>
          </>
        ) : (
          <p className="notice">
            {locale === 'tw'
              ? 'Kyerɛw GHS sika mmienu no na yɛntoto ho.'
              : 'Enter both GHS amounts to compare the charge. Your entries stay in this browser.'}
          </p>
        )}
      </section>
      {result && (
        <section>
          <div className="field">
            <label className="field-label" htmlFor="merchant-name">
              Merchant name (optional)
            </label>
            <input
              className="input"
              id="merchant-name"
              value={name}
              maxLength={120}
              onChange={(e) => {
                setName(e.target.value);
                setCopied('');
              }}
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="payment-date">
              Payment date (optional)
            </label>
            <input
              className="input"
              id="payment-date"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setCopied('');
              }}
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="complaint">
              Message to your payment provider
            </label>
            <textarea className="input message-area" id="complaint" value={message} readOnly />
          </div>
          <p className="help">
            Review the draft and add your transaction reference through your provider’s secure
            support channel. This site never sends the message.
          </p>
          <button
            className="button"
            disabled={copying}
            onClick={() => {
              void copyMessage();
            }}
          >
            {copying ? 'Copying…' : 'Copy message'}
          </button>
          <p className="help" role="status">
            {copying ? 'Copying message.' : copied}
          </p>
        </section>
      )}
      <p className="help">
        If VAT was wrongly charged, GRA says to notify your bank or electronic money issuer if the
        refund does not happen automatically. The FAQ gives no guaranteed refund timeframe.
      </p>
      <p className="help">
        <Source questions="12" />
      </p>
    </div>
  );
}
