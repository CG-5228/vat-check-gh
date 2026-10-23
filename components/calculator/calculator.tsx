'use client';
import { useState } from 'react';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { Copy, Check } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { parseMoney, formatMoney } from '@/lib/money';
import { calculateTax } from '@/lib/tax';
import { PageIntro } from '@/components/ui/shell';
import { Source } from '@/components/ui/source';
export default function Calculator() {
  const { t } = useLanguage();
  const [amount, setAmount] = useState('100');
  const [mode, setMode] = useState<'exclusive' | 'inclusive'>('exclusive');
  const [copied, setCopied] = useState('');
  const parsed = parseMoney(amount);
  const result = parsed.value !== null ? calculateTax(parsed.value, mode) : null;
  async function copy() {
    if (!result) return;
    const text = `VAT Check GH estimate\nBase: ${formatMoney(result.base)}\nVAT (15%): ${formatMoney(result.vat)}\nNHIL (2.5%): ${formatMoney(result.nhil)}\nGETFund (2.5%): ${formatMoney(result.getfund)}\nTotal: ${formatMoney(result.total)}\nEstimate with assumed rounding. GRA FAQ Q9, page 2.\nRates and calculation base: https://gra.gov.gh/domestic-tax/tax-types/vat/`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied('Copied');
    } catch {
      setCopied('Copy unavailable. Select the values above to copy.');
    }
  }
  return (
    <div className="page-container">
      <PageIntro
        eyebrow="A LITTLE MATH. A LOT OF CLARITY."
        title={t.calcTitle}
        description={t.calcSubtitle}
      />
      <div className="two-col">
        <div className="panel">
          <label className="field-label" htmlFor="amount">
            {t.amount}
          </label>
          <div className="money-input-wrap">
            <span>GHS</span>
            <input
              className="input"
              id="amount"
              inputMode="decimal"
              autoComplete="off"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setCopied('');
              }}
              aria-describedby="amount-help amount-error"
              aria-invalid={!!parsed.error}
            />
          </div>
          <p id="amount-help" className="help">
            {t.calcNote} Maximum GH₵1,000,000.00.
          </p>
          <p id="amount-error" role="status" className="error">
            {amount ? parsed.error : null}
          </p>
          <ToggleGroup.Root
            type="single"
            value={mode}
            onValueChange={(v) => {
              if (v === 'exclusive' || v === 'inclusive') {
                setMode(v);
                setCopied('');
              }
            }}
            className="mode-toggle"
            aria-label="How tax is included"
          >
            <ToggleGroup.Item value="exclusive">
              <span className="radio-ring" />
              {t.exclusive}
            </ToggleGroup.Item>
            <ToggleGroup.Item value="inclusive">
              <span className="radio-ring" />
              {t.inclusive}
            </ToggleGroup.Item>
          </ToggleGroup.Root>
          <div className="notice">
            <strong>About this estimate</strong>
            <br />
            VAT, NHIL and GETFund use the same price before tax. This calculator assumes rounding to
            the nearest pesewa. Provider rounding may differ.
          </div>
          <Source questions="9" />
          <br />
          <a className="source-link" href="https://gra.gov.gh/domestic-tax/tax-types/vat/">
            GRA VAT guidance · rates and calculation base ↗
          </a>
        </div>
        <section className="panel estimate-panel" aria-live="polite" aria-atomic="true">
          <h2>{t.estimate}</h2>
          {result ? (
            <>
              <table className="breakdown">
                <caption className="sr-only">Tax breakdown in Ghana cedis</caption>
                <tbody>
                  <tr>
                    <th scope="row">{t.base}</th>
                    <td>{formatMoney(result.base)}</td>
                  </tr>
                  <tr>
                    <th scope="row">
                      VAT <small>15%</small>
                    </th>
                    <td>{formatMoney(result.vat)}</td>
                  </tr>
                  <tr>
                    <th scope="row">
                      NHIL <small>2.5%</small>
                    </th>
                    <td>{formatMoney(result.nhil)}</td>
                  </tr>
                  <tr>
                    <th scope="row">
                      GETFund <small>2.5%</small>
                    </th>
                    <td>{formatMoney(result.getfund)}</td>
                  </tr>
                  <tr className="sum-row">
                    <th scope="row">{t.tax}</th>
                    <td>{formatMoney(result.totalTax)}</td>
                  </tr>
                </tbody>
              </table>
              <div className="grand-total">
                <span>{t.total}</span>
                <strong>{formatMoney(result.total)}</strong>
              </div>
              <button
                className="button"
                onClick={() => {
                  void copy();
                }}
              >
                {copied === 'Copied' ? <Check size={16} /> : <Copy size={16} />}{' '}
                {copied === 'Copied' ? t.copied : t.copy}
              </button>
              <div className="copy-status" role="status">
                {copied !== 'Copied' ? copied : ''}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>Enter a valid amount to see your estimate.</p>
            </div>
          )}
          <p className="section-note">
            Rates effective 1 January 2026. This estimate does not determine whether your purchase
            is taxable.
          </p>
        </section>
      </div>
    </div>
  );
}
