'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { sourceDateLabel } from '@/lib/source';
const en = {
  home: 'Check a service',
  calculator: 'Tax calculator',
  doubleCharge: 'Check a charge',
  faq: 'FAQs',
  about: 'About',
  apply: 'Does it apply to me?',
  eyebrow: 'A LITTLE CLARITY FOR YOUR DIGITAL LIFE',
  title: 'Your subscriptions.\nYour money.\nYour VAT, explained.',
  subtitle:
    'Check a service, understand Ghana’s digital VAT, and make sense of what you pay. Free, independent, and backed by official sources.',
  searchLabel: 'Service or merchant',
  searchPlaceholder: 'Try Netflix, ChatGPT, Spotify…',
  searchHint: 'Search by the name you know. We’ll find the legal name.',
  popular: 'POPULAR SEARCHES',
  listed: 'On the GRA list',
  unlisted: 'Not on this list',
  tools: 'A few tools. A clearer picture.',
  toolsIntro: 'From a quick estimate to a closer look at a charge.',
  openTool: 'Open tool',
  more: 'How does digital VAT work?',
  source: 'Official sources. Plain language.',
  sourceText:
    'Our merchant records come from GRA’s published list. Every tax explanation links back to the guidance behind it.',
  noMatch: 'No match on this GRA list',
  noMatchText: `Not on GRA’s list as of ${sourceDateLabel}. Your bank or MoMo may add tax at payment if the transaction qualifies. Absence from this list does not mean tax-free.`,
  dataAsOf: 'Data as of',
  disclaimer: 'Not affiliated with GRA. Not tax or legal advice. Check official GRA guidance.',
  back: 'Back',
  next: 'Next',
  restart: 'Start again',
  copy: 'Copy result',
  copied: 'Copied',
  registeredMeaning:
    'Registration does not tell you whether your invoice includes tax. GRA says registered providers should show prices before VAT, with tax collected at payment.',
  resultHeading: 'What this means for your payment',
  share: 'Share this result',
  calcTitle: 'Know where every pesewa goes.',
  calcSubtitle:
    'See the tax on a digital service, or work backwards from a price that includes it.',
  amount: 'Amount in Ghana cedis',
  exclusive: 'Tax added on top',
  inclusive: 'Price already includes tax',
  calcNote: 'Use the GHS amount on your statement. This tool does not convert currencies.',
  base: 'Price before tax',
  total: 'Total you pay',
  tax: 'Total tax',
  estimate: 'YOUR ESTIMATE',
  checkTitle: 'Does RTVAT apply to you?',
  checkSubtitle: 'Three quick questions about your purchase. No personal details needed.',
  chargeTitle: 'Charged more than you expected?',
  chargeSubtitle:
    'Compare a merchant receipt with your statement. We’ll help you understand the difference.',
  footerTag: 'A clearer view of what you pay.',
  review:
    'Twi translation is a draft and needs native-speaker review. Some detailed guidance remains in English.',
};
// ASSUMPTION: Draft Twi key UI/outcomes need native-speaker review. No translation is official.
const tw: typeof en = {
  ...en,
  home: 'Hwɛ dwumadie bi',
  calculator: 'Toɔ akontabuo',
  doubleCharge: 'Hwɛ sika a wɔagye',
  faq: 'Nsɛmmisa',
  about: 'Yɛn ho nsɛm',
  apply: 'Ɛfa me ho anaa?',
  eyebrow: 'HU SIKA A WOTUA NO MU YIE',
  title: 'Wo subscriptions.\nWo sika.\nWo VAT ho nkyerɛkyerɛmu.',
  subtitle: 'Hwɛ dwumadie bi, sua Ghana digital VAT ho adeɛ, na te sika a wotua no ase.',
  searchLabel: 'Dwumadie anaa adetɔnfoɔ',
  searchPlaceholder: 'Hwehwɛ Netflix, ChatGPT, Spotify…',
  searchHint: 'Fa din a wonim no hwehwɛ.',
  popular: 'DIN A WƆHWEHWƐ NO PII',
  listed: 'Ɛwɔ GRA din no mu',
  unlisted: 'Ɛnni din yi mu',
  tools: 'Nnwinnadeɛ a ɛma emu da hɔ.',
  toolsIntro: 'Hwɛ toɔ no anaa sika a wɔagye wo.',
  openTool: 'Bue',
  more: 'Digital VAT yɛ adwuma sɛn?',
  source: 'GRA nsɛm. Nkyerɛkyerɛmu a emu da hɔ.',
  noMatch: 'Yɛanhunu saa din yi wɔ GRA din no mu',
  noMatchText: `Ɛnni GRA din a ɛwɔ ${sourceDateLabel} no mu. Sɛ wo ntua no fata a, wo bank anaa MoMo betumi agye toɔ.`,
  dataAsOf: 'Nsɛm yi yɛ deɛ ɛwɔ',
  back: 'San kɔ',
  next: 'Kɔ anim',
  restart: 'Hyɛ aseɛ bio',
  copy: 'Fa mmuaeɛ no',
  copied: 'Yɛafa',
  resultHeading: 'Deɛ ɛkyerɛ ma wo ntua',
  registeredMeaning:
    'Sɛ adetɔnfoɔ no din wɔ GRA din no mu a, ɛnkyerɛ sɛ toɔ wɔ wo invoice mu. GRA ka sɛ wɔmfa boɔ a toɔ nka ho nkyerɛ, na wɔgye toɔ berɛ a wotua sika.',
  share: 'Kyɛ mmuaeɛ yi',
  calcTitle: 'Hu pesewa biara faako a ɛkɔ.',
  calcSubtitle: 'Hwɛ toɔ a ɛka digital dwumadie bi ho.',
  amount: 'Sika wɔ Ghana cedis mu',
  exclusive: 'Fa toɔ ka ho',
  inclusive: 'Toɔ ka boɔ no ho dedaw',
  calcNote: 'Fa GHS sika a ɛwɔ wo statement so no. Yɛnsesa aman foforɔ sika.',
  base: 'Boɔ ansa na toɔ aba',
  total: 'Sika a wotua nyinaa',
  tax: 'Toɔ nyinaa',
  estimate: 'WO AKONTABUO',
  checkTitle: 'RTVAT fa wo ho anaa?',
  checkSubtitle: 'Nsɛmmisa mmiɛnsa fa wo ntɔeɛ ho.',
  chargeTitle: 'Wɔagye sika boro deɛ wohwɛɛ kwan?',
  chargeSubtitle: 'Fa wo receipt toto wo statement ho.',
  footerTag: 'Te sika a wotua no ase.',
};
type Locale = 'en' | 'tw';
const Context = createContext({
  locale: 'en' as Locale,
  t: en,
  setLocale: (_locale: Locale) => {},
});
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');
  useEffect(() => {
    if (localStorage.getItem('vat-language') === 'tw') setLocale('tw');
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale === 'tw' ? 'tw' : 'en';
    localStorage.setItem('vat-language', locale);
  }, [locale]);
  return (
    <Context.Provider value={{ locale, t: locale === 'en' ? en : tw, setLocale }}>
      {children}
    </Context.Provider>
  );
}
export const useLanguage = () => useContext(Context);
