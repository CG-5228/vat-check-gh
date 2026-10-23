'use client';
import { useState } from 'react';
import { CheckCircle2, CircleHelp, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getEligibility, type EligibilityAnswers } from '@/lib/eligibility';
import { useLanguage } from '@/lib/i18n';
import { PageIntro } from './ui/shell';
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
  const q = questions[step] ?? questions[0];
  const outcome = getEligibility(answers);
  const titles = {
    applies: locale === 'tw' ? 'RTVAT fa ntua yi ho' : 'This payment meets the RTVAT conditions',
    'likely-applies': locale === 'tw' ? 'Ebetumi afa ntua yi ho' : 'RTVAT is likely to apply',
    'does-not-apply':
      locale === 'tw'
        ? 'Ntua yi nhyia RTVAT ahwehwɛdeɛ no'
        : 'This payment does not meet all RTVAT conditions',
    unclear: locale === 'tw' ? 'Yɛhia nsɛm pii' : 'A little more information is needed',
  };
  return (
    <div className="page-container">
      <PageIntro
        eyebrow="THE THREE-QUESTION CHECK"
        title={t.checkTitle}
        description={t.checkSubtitle}
      />
      <div className="panel stepper">
        {!finished ? (
          <>
            <div className="step-meta">
              <span>Question {step + 1} of 3</span>
              <span>About 30 seconds</span>
            </div>
            <div
              className="progress-track"
              role="progressbar"
              aria-valuemin={1}
              aria-valuemax={3}
              aria-valuenow={step + 1}
              aria-label={`Step ${step + 1} of 3`}
            >
              {questions.map((x, i) => (
                <span key={x.key} className={i <= step ? 'done' : ''} />
              ))}
            </div>
            <h2 id="question-title">{locale === 'tw' ? q.tw : q.title}</h2>
            <p className="help">{q.help}</p>
            <fieldset className="choice-list" aria-labelledby="question-title">
              <legend className="sr-only">Select an answer</legend>
              {(['yes', 'no', 'unsure'] as const).map((value) => (
                <label className="choice" key={value}>
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
            <Source questions="11, 13" />
            <div className="step-actions">
              <button
                className="button button-light"
                disabled={step === 0}
                onClick={() => setStep(step - 1)}
              >
                {t.back}
              </button>
              <button
                className="button"
                disabled={!selected[step]}
                onClick={() => {
                  if (step === 2) setFinished(true);
                  else setStep(step + 1);
                }}
              >
                {step === 2 ? 'See my result' : t.next}
                <ArrowRight size={16} />
              </button>
            </div>
          </>
        ) : (
          <div className="outcome">
            <span className={`status-badge ${outcome.result === 'unclear' ? 'warning' : ''}`}>
              {outcome.result === 'unclear' ? <CircleHelp size={16} /> : <CheckCircle2 size={16} />}
              Your quick check
            </span>
            <h2>{titles[outcome.result]}</h2>
            <p>{outcome.reason}</p>
            <div className="notice">
              This checks the RTVAT collection conditions only. It does not establish a VAT
              exemption or prove that a particular charge is correct.
            </div>
            <Source questions="13–15" />
            <div className="share-actions">
              <button
                className="button button-light"
                onClick={() => {
                  setStep(0);
                  setFinished(false);
                  setSelected({});
                }}
              >
                {t.restart}
              </button>
              <Link className="button" href="/calculator/">
                Estimate the tax <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
