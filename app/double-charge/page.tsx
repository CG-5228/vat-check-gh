import DoubleCharge from '@/components/double-charge';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata(
  'Check a possible double VAT charge',
  '/double-charge/',
  'Compare a receipt with a bank or MoMo statement and draft a message to your provider.',
);
export default function Page() {
  return <DoubleCharge />;
}
