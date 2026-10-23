import Calculator from '@/components/calculator/calculator';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata(
  'Digital VAT calculator',
  '/calculator/',
  'Calculate Ghana digital VAT and levies using exact integer pesewas.',
);
export default function Page() {
  return <Calculator />;
}
