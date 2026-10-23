/** Integer Ghana pesewas. Conversion from decimal text never uses floating money math. */
declare const pesewasBrand: unique symbol;
export type Pesewas = number & { readonly [pesewasBrand]: true };
export const MAX_AMOUNT = 100_000_000;
export function pesewas(value: number | bigint): Pesewas {
  const result = Number(value);
  if (!Number.isSafeInteger(result) || result < 0)
    throw new RangeError('Money must be non-negative integer pesewas.');
  return result as Pesewas;
}
export function roundRatio(numerator: bigint, denominator: bigint): bigint {
  if (denominator <= 0n || numerator < 0n)
    throw new RangeError('Expected a non-negative amount and a positive denominator.');
  return (numerator * 2n + denominator) / (denominator * 2n);
}
export function parseMoney(input: string): { value: Pesewas | null; error: string | null } {
  const text = input.trim();
  if (!text) return { value: null, error: null };
  if (!/^\d+(?:\.\d{1,2})?$/.test(text))
    return {
      value: null,
      error: 'Enter a GHS amount with up to 2 decimal places, such as 100.00.',
    };
  const [whole = '0', fraction = ''] = text.split('.');
  // Bound digit count before BigInt conversion, including unusually long pasted input.
  if (whole.length > 9)
    return { value: null, error: 'Enter an amount of GH₵1,000,000.00 or less.' };
  const amount = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'));
  if (amount > BigInt(MAX_AMOUNT))
    return { value: null, error: 'Enter an amount of GH₵1,000,000.00 or less.' };
  return { value: pesewas(amount), error: null };
}
export function formatMoney(amount: Pesewas): string {
  const whole = (BigInt(amount) / 100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `GH₵${whole}.${(BigInt(amount) % 100n).toString().padStart(2, '0')}`;
}
