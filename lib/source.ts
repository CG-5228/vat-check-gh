import sourceMeta from '../data/source-meta.json';
import rates from '../data/rates.json';

/** Stable UTC labels keep source dates identical during static rendering and hydration. */
const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});
function dateLabel(isoDate: string): string {
  return dateFormatter.format(new Date(`${isoDate}T00:00:00Z`));
}
export const sourceDate = sourceMeta.sourceDate;
export const verifiedAt = sourceMeta.verifiedAt;
export const merchantSourceUrl = sourceMeta.merchantsPdfUrl;
export const sourceDateLabel = dateLabel(sourceDate);
export const verifiedAtLabel = dateLabel(verifiedAt);
export const ratesEffectiveLabel = dateLabel(rates.effectiveFrom);
