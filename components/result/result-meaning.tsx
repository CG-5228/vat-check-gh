'use client';
import { useLanguage } from '@/lib/i18n';

export default function ResultMeaning() {
  const { t } = useLanguage();
  return <p>{t.registeredMeaning}</p>;
}
