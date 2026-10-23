import Eligibility from '@/components/eligibility';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata(
  'Does RTVAT apply?',
  '/apply/',
  'Check three GRA conditions for RTVAT on a foreign digital service.',
);
export default function Page() {
  return <Eligibility />;
}
