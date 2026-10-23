'use client';
import { useState } from 'react';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { useLanguage } from '@/lib/i18n';
import { parseMoney, formatMoney } from '@/lib/money';
import { calculateTax } from '@/lib/tax';
import { ratesEffectiveLabel } from '@/lib/source';
import MoneyFigure from '@/components/ui/money-figure';
import { Source } from '@/components/ui/source';
export default function Calculator() {
  const { t, locale } = useLanguage();
  const [amount, setAmount] = useState('100');
  const [mode, setMode] = useState<'exclusive' | 'inclusive'>('exclusive');
  const [copied, setCopied] = useState('');
  const [copying, setCopying] = useState(false);
  const parsed = parseMoney(amount);
  const result = parsed.value !== null ? calculateTax(parsed.value, mode) : null;
  async function copy() {
    if (!result) return;
    const text = `VAT Check GH estimate\nBase: ${formatMoney(result.base)}\nVAT (15%): ${formatMoney(result.vat)}\nNHIL (2.5%): ${formatMoney(result.nhil)}\nGETFund (2.5%): ${formatMoney(result.getfund)}\nTotal: ${formatMoney(result.total)}\nEstimate with assumed rounding. GRA FAQ Q9, page 2.\nRates and calculation base: https://gra.gov.gh/domestic-tax/tax-types/vat/`;
    setCopying(true);
    setCopied('');
    try {
      await navigator.clipboard.writeText(text);
      setCopied('Copied');
    } catch {
      setCopied('Copy unavailable. Select the values above to copy.');
    } finally {
      setCopying(false);
    }
  }
  return (
    <div className="instrument">
      <h1 className="sr-only">{t.calculator}</h1>
      <div className="field">
        <label className="field-label" htmlFor="amount">
          {t.amount}
        </label>
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
          aria-describedby={`amount-help${parsed.error ? ' amount-error' : ''}`}
          aria-invalid={!!parsed.error}
        />
        {parsed.error && (
          <p id="amount-error" role="status" className="error">
            {parsed.error}
          </p>
        )}
      </div>
      <ToggleGroup.Root
        type="single"
        value={mode}
        onValueChange={(value) => {
          if (value === 'exclusive' || value === 'inclusive') {
            setMode(value);
            setCopied('');
          }
        }}
        className="mode-toggle"
        aria-label="How tax is included"
      >
        <ToggleGroup.Item className="button button-light" value="exclusive">
          {t.exclusive}
        </ToggleGroup.Item>
        <ToggleGroup.Item className="button button-light" value="inclusive">
          {t.inclusive}
        </ToggleGroup.Item>
      </ToggleGroup.Root>
      <p id="amount-help" className="help">
        {t.calcNote} Maximum GH₵1,000,000.00.
      </p>
      <section aria-live="polite" aria-atomic="true">
        {result ? (
          <>
            <p className="result-figure">
              <MoneyFigure amount={result.total} />
            </p>
            <p>{t.total}</p>
            <table className="receipt-table">
              <caption className="sr-only">Tax breakdown in Ghana cedis</caption>
              <tbody>
                <tr>
                  <th scope="row">Combined rate</th>
                  <td>20%</td>
                </tr>
                <tr>
                  <th scope="row">{t.base}</th>
                  <td>{formatMoney(result.base)}</td>
                </tr>
                <tr>
                  <th scope="row">VAT · 15%</th>
                  <td>{formatMoney(result.vat)}</td>
                </tr>
                <tr>
                  <th scope="row">NHIL · 2.5%</th>
                  <td>{formatMoney(result.nhil)}</td>
                </tr>
                <tr>
                  <th scope="row">GETFund · 2.5%</th>
                  <td>{formatMoney(result.getfund)}</td>
                </tr>
                <tr>
                  <th scope="row">{t.tax}</th>
                  <td>{formatMoney(result.totalTax)}</td>
                </tr>
                <tr>
                  <th scope="row">{t.total}</th>
                  <td>{formatMoney(result.total)}</td>
                </tr>
              </tbody>
            </table>
          </>
        ) : (
          <p className="notice">
            {locale === 'tw'
              ? 'Kyerɛw sika a ɛfata na woahu akontabuo no.'
              : 'Enter a valid amount to see your estimate.'}
          </p>
        )}
      </section>
      {result && (
        <div className="controls">
          <button
            className="button"
            disabled={copying}
            onClick={() => {
              void copy();
            }}
          >
            {copying
              ? locale === 'tw'
                ? 'Ɛretwɛn…'
                : 'Copying…'
              : copied === 'Copied'
                ? t.copied
                : t.copy}
          </button>
          <p className="help" role="status">
            {copying ? 'Copying estimate.' : copied !== 'Copied' ? copied : 'Copied'}
          </p>
        </div>
      )}
      <p className="help">
        VAT, NHIL and GETFund use the same price before tax. Rounding to the nearest pesewa is an
        estimate; provider rounding may differ. Rates effective {ratesEffectiveLabel}. This does not
        determine whether your purchase is taxable.
      </p>
      <p className="help">
        <Source questions="9" />
      </p>
      <p className="help">
        <a href="https://gra.gov.gh/domestic-tax/tax-types/vat/">
          GRA VAT guidance: rates and calculation base
        </a>
      </p>
    </div>
  );
}
