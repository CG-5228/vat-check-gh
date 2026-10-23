import Fuse from 'fuse.js';
import rawMerchants from '../data/merchants.json';
import rawMeta from '../data/source-meta.json';
import rawRates from '../data/rates.json';
import type { Merchant, RateConfig, SourceMeta } from './data-schema';
import { normalizeName, resolveAlias } from './aliases';

// Data is validated at build time by scripts/validate-data.ts. Keep zod out of the browser bundle.
export const merchants: Merchant[] = rawMerchants;
export const sourceMeta: SourceMeta = rawMeta;
export const rates = rawRates as RateConfig;
export function getMerchant(slug: string): Merchant | undefined {
  return merchants.find((merchant) => merchant.slug === slug);
}
export const popularMerchants = [
  'netflix',
  'spotify',
  'chatgpt',
  'apple',
  'google-commerce-limited-ireland',
  'adobe',
].flatMap((slug) => {
  const item = getMerchant(slug);
  return item ? [item] : [];
});
let index: Fuse<Merchant> | undefined;
export function searchMerchants(query: string): Merchant[] {
  if (!normalizeName(query)) return popularMerchants;
  const exactNames = resolveAlias(query);
  const exact = merchants.filter((merchant) => exactNames.includes(merchant.legalName));
  index ??= new Fuse(merchants, {
    keys: [
      { name: 'aliases', weight: 3 },
      { name: 'tradingNames', weight: 2 },
      { name: 'legalName', weight: 1 },
    ],
    threshold: 0.32,
    ignoreLocation: true,
    minMatchCharLength: 2,
  });
  const fuzzy = index.search(query, { limit: 8 }).map((result) => result.item);
  return [
    ...exact,
    ...fuzzy.filter((merchant) => !exact.some((match) => match.slug === merchant.slug)),
  ].slice(0, 8);
}
export function merchantName(merchant: Merchant): string {
  return merchant.tradingNames[0] ?? merchant.legalName;
}
