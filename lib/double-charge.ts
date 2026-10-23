import { formatMoney, pesewas, type Pesewas } from './money';
import { calculateTax } from './tax';
export interface ChargeInput {
  merchantAmount: Pesewas;
  statementAmount: Pesewas;
  merchantIncludesTax: boolean | 'unknown';
}
export interface ChargeAssessment {
  verdict:
    'possible-duplicate' | 'consistent-with-once' | 'same-amount' | 'lower-statement' | 'unclear';
  title: string;
  explanation: string;
  difference: number;
  expectedOnce: Pesewas;
  faqRef: string;
}
/** A comparison is a screening estimate. Invoices, FX, fees and refunds can change totals. */
export function assessCharge(input: ChargeInput): ChargeAssessment {
  const { merchantAmount, statementAmount, merchantIncludesTax } = input;
  pesewas(merchantAmount);
  pesewas(statementAmount);
  const expectedOnce = calculateTax(merchantAmount, 'exclusive').total;
  const difference = statementAmount - merchantAmount;
  const common = { difference, expectedOnce, faqRef: 'GRA FAQ, question 12 (page 2)' };
  if (merchantAmount === 0)
    return {
      ...common,
      verdict: 'unclear',
      title: 'There is not enough information',
      explanation:
        'A zero merchant charge cannot show whether tax was collected once or twice. Check the receipt and any fees or pending card holds.',
    };
  if (statementAmount < merchantAmount)
    return {
      ...common,
      verdict: 'lower-statement',
      title: 'The statement amount is lower',
      explanation:
        'These amounts do not suggest an extra tax charge. Check for refunds, partial payments, different dates or currency conversion. Enter matching settled GHS amounts.',
    };
  if (statementAmount === merchantAmount)
    return {
      ...common,
      verdict: 'same-amount',
      title: 'No extra amount appears here',
      explanation:
        'The two amounts match. This comparison cannot tell whether the merchant included tax. Check the receipt for its tax breakdown.',
    };
  // ASSUMPTION: A one-pesewa tolerance accounts for rounding. Matching 20% is a clue only.
  const matchesTax = Math.abs(statementAmount - expectedOnce) <= 1;
  if (matchesTax && merchantIncludesTax === true)
    return {
      ...common,
      verdict: 'possible-duplicate',
      title: 'Possible duplicate tax, check with your provider',
      explanation:
        'You confirmed that the merchant amount already includes Ghana tax, and the statement is about 20% higher. This could be duplicate tax, but fees or conversion may explain it. Ask the provider to review both records.',
    };
  if (matchesTax && merchantIncludesTax === false)
    return {
      ...common,
      verdict: 'consistent-with-once',
      title: 'The difference is consistent with one tax charge',
      explanation:
        'You said the merchant amount excludes Ghana tax. The statement is about 20% higher, which matches one combined RTVAT charge. This is an estimate, not proof that every charge is correct.',
    };
  return {
    ...common,
    verdict: 'unclear',
    title: 'The amounts alone cannot settle this',
    explanation:
      'Check whether the receipt already includes Ghana tax and whether fees, exchange rates or pending holds changed the total. A 20% difference alone does not prove duplicate tax.',
  };
}
export function complaintMessage(input: {
  merchantAmount: Pesewas;
  statementAmount: Pesewas;
  merchantName?: string;
  paymentDate?: string;
}): string {
  const merchant = input.merchantName?.trim() || '[merchant name]';
  const date = input.paymentDate?.trim() || '[payment date]';
  return `Hello, please review a possible incorrect RTVAT charge on my payment to ${merchant} on ${date}. The merchant receipt shows ${formatMoney(input.merchantAmount)} and my settled statement shows ${formatMoney(input.statementAmount)}. Please confirm the tax, fees and currency conversion applied, and whether the receipt already includes Ghana VAT and levies. If VAT was charged incorrectly and has not been automatically refunded, please arrange the appropriate correction or refund. I can provide the receipt and transaction reference through your secure support channel. GRA's RTVAT FAQ, question 12 (page 2), says to notify the bank or Electronic Money Issuer if an incorrect charge is not automatically refunded. Thank you.`;
}
