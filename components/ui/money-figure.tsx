import { formatMoney, type Pesewas } from '@/lib/money';
export default function MoneyFigure({
  amount,
  negative = false,
}: {
  amount: Pesewas;
  negative?: boolean;
}) {
  const value = formatMoney(amount);
  return (
    <>
      <span>{negative ? '−' : ''}GH₵</span>
      <wbr />
      <span className="figure-amount">{value.slice(3)}</span>
    </>
  );
}
