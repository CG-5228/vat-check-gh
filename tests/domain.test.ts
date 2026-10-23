import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { MAX_AMOUNT, formatMoney, parseMoney, pesewas, roundRatio } from '../lib/money';
import { calculateTax } from '../lib/tax';
import {
  getEligibility,
  type EligibilityAnswer,
  type EligibilityAnswers,
} from '../lib/eligibility';
import { assessCharge, complaintMessage } from '../lib/double-charge';
const p = pesewas;
describe('integer money parsing', () => {
  it.each([
    ['100', 10000],
    ['0', 0],
    ['0.01', 1],
    ['1000000.00', MAX_AMOUNT],
    [' 12.3 ', 1230],
  ])('parses %s without floating money math', (input, expected) =>
    expect(parseMoney(input).value).toBe(expected),
  );
  it.each(['-1', 'NaN', 'Infinity', '1e2', '1.001', '£5', '1,000', '1000000.01', '9'.repeat(200)])(
    'rejects %s',
    (input) => expect(parseMoney(input).error).toBeTruthy(),
  );
  it('allows empty state without an error', () =>
    expect(parseMoney('')).toEqual({ value: null, error: null }));
  it('rejects noninteger and unsafe internal values', () => {
    expect(() => p(0.5)).toThrow();
    expect(() => p(-1)).toThrow();
    expect(() => p(Number.MAX_SAFE_INTEGER + 1)).toThrow();
  });
  it('formats without a floating currency conversion', () => {
    expect(formatMoney(p(1))).toBe('GH₵0.01');
    expect(formatMoney(p(100000000))).toBe('GH₵1,000,000.00');
  });
});
describe('VAT and levy estimate', () => {
  it('recomputes GH₵100 excluding tax by hand', () =>
    expect(calculateTax(p(10000), 'exclusive')).toEqual({
      base: 10000,
      vat: 1500,
      nhil: 250,
      getfund: 250,
      totalTax: 2000,
      total: 12000,
    }));
  it('recomputes GH₵120 inclusive by hand', () =>
    expect(calculateTax(p(12000), 'inclusive')).toEqual({
      base: 10000,
      vat: 1500,
      nhil: 250,
      getfund: 250,
      totalTax: 2000,
      total: 12000,
    }));
  it('recomputes GH₵99.99 excluding tax by hand', () =>
    expect(calculateTax(p(9999), 'exclusive')).toEqual({
      base: 9999,
      vat: 1500,
      nhil: 250,
      getfund: 250,
      totalTax: 2000,
      total: 11999,
    }));
  it('handles zero both ways', () => {
    expect(calculateTax(p(0), 'exclusive').total).toBe(0);
    expect(calculateTax(p(0), 'inclusive').base).toBe(0);
  });
  it('rounds half a pesewa up exactly', () => {
    expect(roundRatio(5n, 10n)).toBe(1n);
    expect(roundRatio(4n, 10n)).toBe(0n);
    expect(roundRatio(15n, 10n)).toBe(2n);
  });
  it('allocates half-pesewa levies deterministically and preserves totals', () =>
    expect(calculateTax(p(20), 'exclusive')).toEqual({
      base: 20,
      vat: 3,
      nhil: 1,
      getfund: 0,
      totalTax: 4,
      total: 24,
    }));
  it('preserves an inclusive price that does not divide evenly', () =>
    expect(calculateTax(p(100), 'inclusive')).toEqual({
      base: 83,
      vat: 13,
      nhil: 2,
      getfund: 2,
      totalTax: 17,
      total: 100,
    }));
  it('round-trips exclusive then inclusive within one pesewa', () =>
    fc.assert(
      fc.property(fc.integer({ min: 0, max: MAX_AMOUNT }), (amount) => {
        const exclusive = calculateTax(p(amount), 'exclusive');
        const inclusive = calculateTax(exclusive.total, 'inclusive');
        expect(Math.abs(inclusive.base - amount)).toBeLessThanOrEqual(1);
      }),
      { numRuns: 3000 },
    ));
  it('always has nonnegative integers, preserves all sums and inclusive inputs', () =>
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: MAX_AMOUNT }),
        fc.constantFrom('exclusive' as const, 'inclusive' as const),
        (amount, mode) => {
          const result = calculateTax(p(amount), mode);
          for (const value of Object.values(result)) {
            expect(Number.isSafeInteger(value)).toBe(true);
            expect(value).toBeGreaterThanOrEqual(0);
          }
          expect(result.vat + result.nhil + result.getfund).toBe(result.totalTax);
          expect(result.base + result.totalTax).toBe(result.total);
          if (mode === 'inclusive') expect(result.total).toBe(amount);
        },
      ),
      { numRuns: 3000 },
    ));
});
describe('RTVAT collection eligibility, GRA FAQ Q13', () => {
  const allYes: EligibilityAnswers = {
    outsideGhana: 'yes',
    digitalService: 'yes',
    ghanaIssuedPayment: 'yes',
  };
  it('applies when all three conditions are met', () =>
    expect(getEligibility(allYes).result).toBe('applies'));
  it.each(['outsideGhana', 'digitalService', 'ghanaIssuedPayment'] as const)(
    'does not apply when %s is no',
    (key) => expect(getEligibility({ ...allYes, [key]: 'no' }).result).toBe('does-not-apply'),
  );
  it.each(['outsideGhana', 'digitalService', 'ghanaIssuedPayment'] as const)(
    'is unclear when %s is unknown',
    (key) => expect(getEligibility({ ...allYes, [key]: 'unsure' }).result).toBe('unclear'),
  );
  it('does not treat registration as proof a physical purchase is digital', () => {
    const outcome = getEligibility({ ...allYes, digitalService: 'no' });
    expect(outcome.reason).toContain('does not make every purchase a digital service');
  });
  it('handles all 27 answer combinations and cites Q13', () => {
    const values: EligibilityAnswer[] = ['yes', 'no', 'unsure'];
    for (const outsideGhana of values)
      for (const digitalService of values)
        for (const ghanaIssuedPayment of values) {
          const outcome = getEligibility({ outsideGhana, digitalService, ghanaIssuedPayment });
          const answers = [outsideGhana, digitalService, ghanaIssuedPayment];
          expect(outcome.result).toBe(
            answers.includes('no')
              ? 'does-not-apply'
              : answers.includes('unsure')
                ? 'unclear'
                : 'applies',
          );
          expect(outcome.faqRef).toContain('13');
        }
  });
});
describe('double charge screening, GRA FAQ Q12', () => {
  it('flags a possible duplicate only with confirmed existing Ghana tax', () =>
    expect(
      assessCharge({
        merchantAmount: p(10000),
        statementAmount: p(12000),
        merchantIncludesTax: true,
      }).verdict,
    ).toBe('possible-duplicate'));
  it('recognises a single charge on a tax-exclusive receipt', () =>
    expect(
      assessCharge({
        merchantAmount: p(10000),
        statementAmount: p(12000),
        merchantIncludesTax: false,
      }).verdict,
    ).toBe('consistent-with-once'));
  it('does not infer duplicate tax from a 20 percent difference alone', () =>
    expect(
      assessCharge({
        merchantAmount: p(10000),
        statementAmount: p(12000),
        merchantIncludesTax: 'unknown',
      }).verdict,
    ).toBe('unclear'));
  it('handles lower statements, zero merchant amount and matching amounts', () => {
    expect(
      assessCharge({
        merchantAmount: p(10000),
        statementAmount: p(9000),
        merchantIncludesTax: true,
      }).verdict,
    ).toBe('lower-statement');
    expect(
      assessCharge({ merchantAmount: p(0), statementAmount: p(200), merchantIncludesTax: true })
        .verdict,
    ).toBe('unclear');
    expect(
      assessCharge({
        merchantAmount: p(10000),
        statementAmount: p(10000),
        merchantIncludesTax: true,
      }).verdict,
    ).toBe('same-amount');
  });
  it('does not declare unexplained fees to be tax', () =>
    expect(
      assessCharge({
        merchantAmount: p(10000),
        statementAmount: p(11100),
        merchantIncludesTax: true,
      }).verdict,
    ).toBe('unclear'));
  it('allows one pesewa of estimate rounding', () =>
    expect(
      assessCharge({
        merchantAmount: p(10000),
        statementAmount: p(12001),
        merchantIncludesTax: true,
      }).verdict,
    ).toBe('possible-duplicate'));
  it('makes a polite message with the actual figures, automatic refund caveat and source', () => {
    const message = complaintMessage({
      merchantAmount: p(10000),
      statementAmount: p(12000),
      merchantName: 'Example',
      paymentDate: '2026-10-23',
    });
    expect(message).toContain('Example');
    expect(message).toContain('2026-10-23');
    expect(message).toContain('GH₵100.00');
    expect(message).toContain('GH₵120.00');
    expect(message).toContain('not been automatically refunded');
    expect(message).toContain('question 12');
  });
});
