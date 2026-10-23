import rawRates from '../data/rates.json';
import { pesewas, roundRatio, type Pesewas } from './money';
export const RATE_CONFIG = rawRates;
export type TaxMode = 'exclusive' | 'inclusive';
export interface Breakdown {
  base: Pesewas;
  vat: Pesewas;
  nhil: Pesewas;
  getfund: Pesewas;
  totalTax: Pesewas;
  total: Pesewas;
}
const DENOMINATOR = 10_000n;
const parts = [rawRates.vat, rawRates.nhil, rawRates.getfund].map(BigInt);
const combined = parts.reduce((sum, rate) => sum + rate, 0n);
/** GRA FAQ p2 Q9; GRA VAT reforms 2026: same base, non-compounding. */
export function calculateTax(amount: Pesewas, mode: TaxMode): Breakdown {
  if (rawRates.method !== 'same-base-non-compounding')
    throw new Error('Unsupported tax method. Review the source before calculating.');
  const input = BigInt(pesewas(amount));
  const base =
    mode === 'inclusive' ? roundRatio(input * DENOMINATOR, DENOMINATOR + combined) : input;
  // ASSUMPTION: FAQ does not prescribe invoice rounding. Round the combined tax half-up;
  // allocate to components by largest remainder (VAT, NHIL, GETFund tie order) so sums agree.
  // For inclusive prices preserve the entered total and allocate total minus rounded base.
  const totalTax = mode === 'inclusive' ? input - base : roundRatio(base * combined, DENOMINATOR);
  const amounts = parts.map((rate) => (base * rate) / DENOMINATOR);
  const order = parts
    .map((rate, index) => ({ index, remainder: (base * rate) % DENOMINATOR }))
    .sort((left, right) =>
      left.remainder === right.remainder
        ? left.index - right.index
        : left.remainder > right.remainder
          ? -1
          : 1,
    );
  let remaining = totalTax - amounts.reduce((sum, value) => sum + value, 0n);
  for (const part of order) {
    if (remaining <= 0n) break;
    amounts[part.index] = (amounts[part.index] ?? 0n) + 1n;
    remaining -= 1n;
  }
  if (remaining !== 0n)
    throw new Error('Cannot allocate tax rounding. Review the rate configuration.');
  return {
    base: pesewas(base),
    vat: pesewas(amounts[0] ?? 0n),
    nhil: pesewas(amounts[1] ?? 0n),
    getfund: pesewas(amounts[2] ?? 0n),
    totalTax: pesewas(totalTax),
    total: pesewas(base + totalTax),
  };
}
