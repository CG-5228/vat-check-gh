'use client';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Calculator,
  ShieldCheck,
  ReceiptText,
  CircleHelp,
  Check,
  LockKeyhole,
  BookOpen,
} from 'lucide-react';
import MerchantSearch from './search/merchant-search';
import { useLanguage } from '@/lib/i18n';
import { Source } from './ui/source';
import { merchants } from '@/lib/merchants';
export default function Home() {
  const { t } = useLanguage();
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <div className="independent-label">
            <span className="live-dot" /> INDEPENDENT GUIDANCE FOR GHANA
          </div>
          <h1>
            {t.title.split('\n').map((line, i) => (
              <span key={line} className={i === 2 ? 'accent-heading' : ''}>
                {line}
              </span>
            ))}
          </h1>
          <p className="hero-subtitle">{t.subtitle}</p>
          <MerchantSearch />
          <div className="hero-assurances">
            <span>
              <ShieldCheck size={15} />
              Official GRA sources
            </span>
            <span>
              <LockKeyhole size={14} />
              No personal data needed
            </span>
          </div>
        </div>
        <div className="hero-art">
          <div className="art-grid" />
          <div className="circle-drawing circle-one" />
          <div className="circle-drawing circle-two" />
          <span className="art-spark spark-one">✳</span>
          <span className="art-spark spark-two">✦</span>
          <div className="receipt">
            <div className="receipt-top">
              <div className="receipt-icon">
                <ReceiptText size={24} />
              </div>
              <span>LET’S BREAK IT DOWN</span>
              <span className="receipt-date">GHANA · 2026</span>
            </div>
            <div className="receipt-heading">
              A little less guessing.
              <br />
              <span>A lot more clarity.</span>
            </div>
            <div className="receipt-rule" />
            <div className="receipt-line">
              <span>Your digital service</span>
              <strong>GH₵ 100.00</strong>
            </div>
            <div className="receipt-line">
              <span>
                VAT <small>15%</small>
              </span>
              <strong>15.00</strong>
            </div>
            <div className="receipt-line">
              <span>
                NHIL <small>2.5%</small>
              </span>
              <strong>2.50</strong>
            </div>
            <div className="receipt-line">
              <span>
                GETFund <small>2.5%</small>
              </span>
              <strong>2.50</strong>
            </div>
            <div className="receipt-total">
              <span>Total you pay</span>
              <strong>
                <small>GH₵</small> 120.00
              </strong>
            </div>
            <div className="receipt-note">
              <Check size={15} />
              <span>One combined rate. Clearly explained.</span>
            </div>
            <a className="source-link" href="https://gra.gov.gh/domestic-tax/tax-types/vat/">
              GRA VAT guidance · rates and base ↗
            </a>
          </div>
          <div className="tax-sticker">
            <span>THE COMBINED RATE</span>
            <strong>
              20<span>%</span>
            </strong>
            <small>VAT + NHIL + GETFund</small>
          </div>
          <div className="art-caption">YOUR MONEY SHOULD MAKE SENSE.</div>
        </div>
      </section>
      <section className="facts-strip">
        <div className="container facts-inner">
          <div>
            <strong>
              20<span>%</span>
            </strong>
            <span>
              combined VAT & levies
              <Source questions="9" />
            </span>
          </div>
          <div>
            <strong>{merchants.length}</strong>
            <span>
              registered merchant records<small>From the official GRA list</small>
            </span>
          </div>
          <div>
            <strong>
              100<span>%</span>
            </strong>
            <span>
              free, private & independent<small>Built for everyday payments</small>
            </span>
          </div>
        </div>
      </section>
      <section className="tools-section container">
        <div className="section-top">
          <div>
            <p className="eyebrow">MAKE SENSE OF YOUR PAYMENT</p>
            <h2>{t.tools}</h2>
            <p>{t.toolsIntro}</p>
          </div>
          <Link className="text-link" href="/faq/">
            {t.more}
            <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="tool-grid">
          <Link className="tool-card" href="/calculator/">
            <div className="tool-icon">
              <Calculator size={23} />
            </div>
            <span className="tool-index">01</span>
            <h3>{t.calculator}</h3>
            <p>
              See what’s added to a price, or find the tax already included. Down to the pesewa.
            </p>
            <span className="card-link">
              Calculate your total <ArrowRight size={18} />
            </span>
          </Link>
          <Link className="tool-card" href="/double-charge/">
            <div className="tool-icon yellow">
              <ReceiptText size={23} />
            </div>
            <span className="tool-index">02</span>
            <h3>Was I charged correctly?</h3>
            <p>
              Compare your receipt and statement. Find out what to ask if something doesn’t add up.
            </p>
            <span className="card-link">
              Check a charge <ArrowRight size={18} />
            </span>
          </Link>
          <Link className="tool-card" href="/apply/">
            <div className="tool-icon clay">
              <CircleHelp size={23} />
            </div>
            <span className="tool-index">03</span>
            <h3>{t.apply}</h3>
            <p>Three simple questions to understand whether your payment falls under RTVAT.</p>
            <span className="card-link">
              Take the quick check <ArrowRight size={18} />
            </span>
          </Link>
        </div>
      </section>
      <section className="source-banner container">
        <div className="source-banner-icon">
          <BookOpen size={27} />
        </div>
        <div>
          <h2>{t.source}</h2>
          <p>{t.sourceText}</p>
        </div>
        <Link className="button button-light" href="/about/">
          See our sources <ArrowUpRight size={16} />
        </Link>
      </section>
    </>
  );
}
