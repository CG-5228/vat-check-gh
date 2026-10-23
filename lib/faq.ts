interface FaqItem {
  q: string;
  a: string;
  refs: string;
  page: number;
  extraRef?: { refs: string; page: number };
}
export const faqItems: FaqItem[] = [
  {
    q: 'Is RTVAT a new tax?',
    a: 'No. It changes how VAT on qualifying foreign digital services is collected at payment time.',
    refs: '1, 5–7',
    page: 1,
  },
  {
    q: 'Which payments are covered?',
    a: 'The FAQ sets three conditions: the seller is outside Ghana, the service is supplied electronically, and you use a Ghana-issued card, mobile money account or digital wallet.',
    refs: '11, 13',
    page: 2,
  },
  {
    q: 'How much is the combined rate?',
    a: 'The combined rate is 20%: VAT is 15%, with NHIL and GETFund making up the other 5%. GRA’s VAT guidance sets each levy at 2.5% and puts all three on the same base.',
    refs: '9',
    page: 2,
  },
  {
    q: 'Does registration mean tax is already included?',
    a: 'No. The list confirms registration only. The approved FAQ says registered providers should display prices before VAT and let customers know tax is charged at payment. Check your actual receipt.',
    refs: '14–15',
    page: 2,
  },
  {
    q: 'What if the service is not on the list?',
    a: 'Absence from a dated list does not establish an exemption. The FAQ includes registered and unregistered foreign suppliers of taxable digital services.',
    refs: '14, 16',
    page: 2,
  },
  {
    q: 'What if I was wrongly charged VAT?',
    a: 'If a refund does not arrive automatically, notify the bank or electronic money issuer you paid through. The FAQ does not give a refund deadline. Keep your receipt and transaction reference.',
    refs: '12',
    page: 2,
  },
  {
    q: 'Does a 20% difference prove a double charge?',
    a: 'No. It could be the first collection of tax. Check whether the merchant receipt already includes Ghana tax, then ask your provider to explain the debit. Fees and currency conversion can also cause differences.',
    refs: '9, 12, 15',
    page: 2,
  },
  {
    q: 'Are all purchases from listed merchants digital services?',
    a: 'No. The transaction must still satisfy the electronically supplied service condition. This tool checks RTVAT collection conditions and does not establish exemptions from other taxes.',
    refs: '3–4',
    page: 1,
    extraRef: { refs: '13', page: 2 },
  },
  {
    q: 'Can I enter a price in dollars or another currency?',
    a: 'Enter the GHS amounts on your receipt or statement after conversion. This tool does not fetch exchange rates. If your documents only show a foreign currency, ask the provider for the GHS transaction amount before comparing.',
    refs: '11–13',
    page: 2,
  },
  {
    q: 'Do I need to change how I pay?',
    a: 'The FAQ says customers can continue making their usual digital payments. Customers should receive a notification by SMS or email when VAT is deducted.',
    refs: '7',
    page: 1,
    extraRef: { refs: '8', page: 2 },
  },
];
