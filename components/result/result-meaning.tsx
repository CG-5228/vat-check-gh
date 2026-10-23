'use client';
import { useLanguage } from '@/lib/i18n';
export default function ResultMeaning() {
  const { t } = useLanguage();
  return (
    <>
      <h2>{t.resultHeading}</h2>
      <p>{t.registeredMeaning}</p>
    </>
  );
}
