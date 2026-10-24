'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { getEligibility, type EligibilityAnswers } from '@/lib/eligibility';
import { useLanguage, TranslatedText } from '@/lib/i18n';
import { Source } from './ui/source';
const questions = [
  {
    key: 'outsideGhana',
    title: 'Is the supplier based outside Ghana?',
    tw: 'Adetɔnfoɔ no wɔ Ghana akyi anaa?',
    help: 'Check the business named on your receipt or invoice. A familiar brand can have more than one legal entity.',
  },
  {
    key: 'digitalService',
    title: 'Is this a service delivered electronically?',
    tw: 'Ɛyɛ dwumadie a wɔde internet so ma anaa?',
    help: 'Examples include streaming, software, cloud storage and online gaming. A physical item is different from an electronic service.',
  },
  {
    key: 'ghanaIssuedPayment',
    title: 'Are you paying with a Ghana-issued card, MoMo account or wallet?',
    tw: 'Wode Ghana kaad, MoMo anaa wallet na ɛretua anaa?',
    help: 'The FAQ refers to where the payment instrument is issued. It does not ask for your nationality.',
  },
] as const;
export default function Eligibility() {
  const { t, locale } = useLanguage();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<EligibilityAnswers>({
    outsideGhana: 'unsure',
    digitalService: 'unsure',
    ghanaIssuedPayment: 'unsure',
  });
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [finished, setFinished] = useState(false);
  const focusTarget = useRef<HTMLDivElement>(null);
  const q = questions[step] ?? questions[0];
  const outcome = getEligibility(answers);
  const titles = {
    applies: locale === 'tw' ? 'RTVAT fa ntua yi ho' : 'VAT applies',
    'likely-applies': locale === 'tw' ? 'Ebetumi afa ntua yi ho' : 'RTVAT is likely to apply',
    'does-not-apply':
      locale === 'tw'
        ? 'Ntua yi nhyia RTVAT ahwehwɛdeɛ no'
        : 'This payment does not meet all RTVAT conditions',
    unclear: locale === 'tw' ? 'Yɛhia nsɛm pii' : 'More information is needed',
  };
  function focusQuestion() {
    requestAnimationFrame(() => focusTarget.current?.focus());
  }
  return (
    <div className="instrument">
      <h1 className="sr-only">
        <TranslatedText id="checkTitle" />
      </h1>
      <div ref={focusTarget} tabIndex={-1} aria-live="polite">
        {!finished ? (
          <>
            <fieldset className="field" aria-describedby="question-help">
              <legend className="field-label" id="question-title" lang={locale}>
                {locale === 'tw' ? q.tw : q.title}
              </legend>
              {(['yes', 'no', 'unsure'] as const).map((value) => (
                <label className="choice" key={value} lang={locale}>
                  <input
                    type="radio"
                    name={q.key}
                    value={value}
                    checked={!!selected[step] && answers[q.key] === value}
                    onChange={() => {
                      setAnswers({ ...answers, [q.key]: value });
                      setSelected({ ...selected, [step]: true });
                    }}
                  />
                  {value === 'yes'
                    ? locale === 'tw'
                      ? 'Aane'
                      : 'Yes'
                    : value === 'no'
                      ? locale === 'tw'
                        ? 'Daabi'
                        : 'No'
                      : locale === 'tw'
                        ? 'Mennim'
                        : 'I’m not sure'}
                </label>
              ))}
            </fieldset>
            <div
              className="progress-track"
              role="progressbar"
              aria-label="Eligibility check progress"
              aria-valuemin={1}
              aria-valuemax={3}
              aria-valuenow={step + 1}
            >
              {questions.map((question, index) => (
                <span key={question.key} className={index <= step ? 'done' : ''} />
              ))}
            </div>
            <p className="help" id="question-help">
              {q.help}
            </p>
            {!selected[step] && (
              <p className="help" lang={locale}>
                {locale === 'tw'
                  ? 'Paw mmuaeɛ bi na kɔ anim.'
                  : 'Choose an answer to continue. “I’m not sure” is a valid answer.'}
              </p>
            )}
            <div className="controls">
              <button
                className="button button-light"
                disabled={step === 0}
                onClick={() => {
                  setStep(step - 1);
                  focusQuestion();
                }}
              >
                <TranslatedText id="back" />
              </button>
              <button
                className="button"
                lang={locale}
                disabled={!selected[step]}
                onClick={() => {
                  if (step === 2) setFinished(true);
                  else setStep(step + 1);
                  focusQuestion();
                }}
              >
                {step === 2 ? (locale === 'tw' ? 'Hwɛ mmuaeɛ no' : 'See my result') : t.next}
              </button>
            </div>
            <p className="help">
              <Source questions="11, 13" />
            </p>
          </>
        ) : (
          <>
            <h2
              lang={locale}
              className={`result-figure${outcome.result === 'applies' ? ' vat-applies' : ''}`}
            >
              {titles[outcome.result]}
            </h2>
            <p>{outcome.reason}</p>
            <p className="help">
              This checks the RTVAT collection conditions only. It does not establish a VAT
              exemption or prove that a particular charge is correct.
            </p>
            <p className="help">
              <Source questions="13–15" />
            </p>
            <div className="controls">
              <button
                className="button button-light"
                onClick={() => {
                  setStep(0);
                  setFinished(false);
                  setSelected({});
                  focusQuestion();
                }}
              >
                <TranslatedText id="restart" />
              </button>
              <Link className="button" href="/calculator/" lang={locale}>
                {locale === 'tw' ? t.calculator : 'Estimate the tax'}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
