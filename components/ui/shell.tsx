'use client';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { sourceDateLabel, merchantSourceUrl } from '@/lib/source';
import { GRA_URL } from '@/lib/seo';
export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="VAT Check GH home">
      VAT Check GH
    </Link>
  );
}
export function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <Brand />
      </div>
    </header>
  );
}
export function Footer() {
  const { t, locale, setLocale } = useLanguage();
  return (
    <footer className="footer">
      <button
        className="language"
        onClick={() => setLocale(locale === 'en' ? 'tw' : 'en')}
        aria-label={locale === 'en' ? 'Switch to Twi' : 'Switch to English'}
      >
        {locale === 'en' ? 'Twi' : 'English'}
      </button>
      <nav aria-label="Tools and information">
        <Link href="/">{t.home}</Link>
        <Link href="/calculator/">{t.calculator}</Link>
        <Link href="/apply/">{t.apply}</Link>
        <Link href="/double-charge/">{t.doubleCharge}</Link>
        <Link href="/faq/">{t.faq}</Link>
        <Link href="/about/">{t.about}</Link>
      </nav>
      <p>
        {t.dataAsOf} <strong>{sourceDateLabel}</strong>.<br />
        <a href={merchantSourceUrl}>Official merchant list</a> · <a href={GRA_URL}>GRA guidance</a>
      </p>
      <p>{t.disclaimer}</p>
      {locale === 'tw' && <p className="translation-note">{t.review}</p>}
      <p>Free. Open source. No tracking.</p>
    </footer>
  );
}
