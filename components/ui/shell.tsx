'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Check, Globe2, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { GRA_URL } from '@/lib/seo';
import { sourceDateLabel, merchantSourceUrl } from '@/lib/source';
export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="VAT Check GH home">
      <span className="brand-mark" aria-hidden="true">
        <Check size={23} strokeWidth={3} />
      </span>
      <span>
        VAT Check
        <span className="brand-gh">
          {' '}
          GH
          <span className="ghana-dot" />
        </span>
      </span>
    </Link>
  );
}
export function Header() {
  const { locale, t, setLocale } = useLanguage();
  const path = usePathname();
  const [menu, setMenu] = useState(false);
  const links = [
    ['/', t.home],
    ['/calculator/', t.calculator],
    ['/double-charge/', t.doubleCharge],
    ['/faq/', t.faq],
  ];
  return (
    <>
      <div className="top-ribbon" />
      <header className="header">
        <div className="container header-inner">
          <Brand />
          <nav aria-label="Main navigation" className={menu ? 'nav nav-open' : 'nav'}>
            {links.map(([href, label]) => (
              <Link
                href={href ?? '/'}
                key={href}
                aria-current={path === href ? 'page' : undefined}
                onClick={() => setMenu(false)}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <button
              className="language"
              onClick={() => setLocale(locale === 'en' ? 'tw' : 'en')}
              aria-label={locale === 'en' ? 'Switch to Twi' : 'Switch to English'}
            >
              <Globe2 size={16} />
              <span>{locale === 'en' ? 'EN' : 'TW'}</span>
              <span className="language-alt"> / {locale === 'en' ? 'Twi' : 'English'}</span>
            </button>
            <button
              className="menu-button icon-button"
              aria-label={menu ? 'Close menu' : 'Open menu'}
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      {locale === 'tw' && (
        <div className="translation-note container" role="status">
          {t.review}
        </div>
      )}
    </>
  );
}
export function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <Brand />
            <p>{t.footerTag}</p>
          </div>
          <div className="footer-links">
            <Link href="/about/">{t.about}</Link>
            <Link href="/faq/">{t.faq}</Link>
            <a href={GRA_URL} target="_blank" rel="noreferrer">
              GRA guidance <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            <span className="live-dot" />
            {t.dataAsOf} <strong>{sourceDateLabel}</strong>
            <span className="footer-divider">·</span>
            <a href={merchantSourceUrl}>Official merchant list ↗</a>
          </p>
          <p>{t.disclaimer}</p>
          <p className="privacy-line">Free to use. Open source. No accounts, no tracking.</p>
        </div>
      </div>
    </footer>
  );
}
export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-intro">
      <Link className="back-link" href="/">
        ← Check a service
      </Link>
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="lede">{description}</p>
    </div>
  );
}
