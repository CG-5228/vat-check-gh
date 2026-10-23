export type EligibilityAnswer = 'yes' | 'no' | 'unsure';
export interface EligibilityAnswers {
  outsideGhana: EligibilityAnswer;
  digitalService: EligibilityAnswer;
  ghanaIssuedPayment: EligibilityAnswer;
}
export interface EligibilityOutcome {
  result: 'applies' | 'likely-applies' | 'does-not-apply' | 'unclear';
  reasonKey:
    'allConditions' | 'localSupplier' | 'notDigital' | 'foreignPayment' | 'unknownConditions';
  reason: string;
  faqRef: string;
}
const faqRef = 'GRA FAQ, questions 11 and 13 (page 2)';
/** This tests the RTVAT collection conditions, not whether all VAT law exempts a purchase. */
export function getEligibility(answers: EligibilityAnswers): EligibilityOutcome {
  if (answers.outsideGhana === 'no')
    return {
      result: 'does-not-apply',
      reasonKey: 'localSupplier',
      reason:
        'This RTVAT collection framework covers suppliers outside Ghana. Other Ghana VAT rules may still apply.',
      faqRef,
    };
  if (answers.digitalService === 'no')
    return {
      result: 'does-not-apply',
      reasonKey: 'notDigital',
      reason:
        'This RTVAT collection framework covers services supplied electronically. A merchant being registered does not make every purchase a digital service. Other taxes may still apply.',
      faqRef,
    };
  if (answers.ghanaIssuedPayment === 'no')
    return {
      result: 'does-not-apply',
      reasonKey: 'foreignPayment',
      reason:
        'A Ghana-issued payment instrument is one of the conditions for this RTVAT collection framework. This does not decide whether VAT is owed under other rules.',
      faqRef,
    };
  if (Object.values(answers).some((answer) => answer === 'unsure'))
    return {
      result: 'unclear',
      reasonKey: 'unknownConditions',
      reason:
        'We need all three conditions to be clear. Ask your payment provider or GRA to confirm the details before drawing a conclusion.',
      faqRef,
    };
  return {
    result: 'applies',
    reasonKey: 'allConditions',
    reason:
      'All three RTVAT collection conditions are met: a supplier outside Ghana, an electronically supplied service and a Ghana-issued payment instrument. The provider may collect tax at payment.',
    faqRef,
  };
}
