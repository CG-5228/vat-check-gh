import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import {
  aliasesSchema,
  merchantsSchema,
  rateConfigSchema,
  sourceMetaSchema,
} from '../lib/data-schema';
import { normalizeName, resolveAlias, validateAliases } from '../lib/aliases';
import { getMerchant, merchants, searchMerchants, sourceMeta } from '../lib/merchants';
import aliases from '../data/aliases.json';
import rates from '../data/rates.json';
import { extractPdfLines, parseMerchantLines, type PdfLine } from '../scripts/build-merchants';

const header: PdfLine = { page: 1, text: 'NO. TIN NAME OF NON RESIDENT MERCHANT' };
const fixture = (): PdfLine[] => [
  header,
  ...Array.from({ length: 80 }, (_, i) => ({
    page: 1,
    text: `${i + 1} B${String(i + 1).padStart(10, '0')} Example Company ${i + 1} Ltd`,
  })),
];

describe('official dataset and aliases', () => {
  it('validates committed data and exact source checksum', () => {
    expect(merchantsSchema.parse(merchants)).toHaveLength(sourceMeta.merchantCount);
    expect(sourceMetaSchema.safeParse(sourceMeta).success).toBe(true);
    expect(rateConfigSchema.safeParse(rates).success).toBe(true);
    expect(aliasesSchema.safeParse(aliases).success).toBe(true);
    expect(() => validateAliases(merchants)).not.toThrow();
    const bytes = readFileSync(new URL('../data/sources/merchants.pdf', import.meta.url));
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(sourceMeta.merchantsPdfSha256);
  });
  it('re-extracts every legal name and page from the committed official PDF', async () => {
    const bytes = new Uint8Array(
      readFileSync(new URL('../data/sources/merchants.pdf', import.meta.url)),
    );
    const rows = parseMerchantLines(await extractPdfLines(bytes), merchants.length);
    expect(rows.map((row) => [row.legalName, row.page])).toEqual(
      merchants.map((merchant) => [merchant.legalName, merchant.sourcePage]),
    );
  });
  it.each(['netflix', 'chatgpt', 'spotify'])(
    'resolves %s if and only if its configured entity is present in the actual extracted data',
    (alias) => {
      const configured = aliases[alias as 'netflix' | 'chatgpt' | 'spotify'];
      const present = merchants.filter((merchant) => configured.includes(merchant.legalName));
      expect(resolveAlias(alias)).toEqual(present.map((merchant) => merchant.legalName));
      expect(
        searchMerchants(alias)
          .slice(0, present.length)
          .map((merchant) => merchant.legalName),
      ).toEqual(present.map((merchant) => merchant.legalName));
    },
  );
  it('never permits a new alias to an unlisted entity', () => {
    expect(() =>
      validateAliases(merchants.filter((merchant) => !merchant.aliases.includes('netflix'))),
    ).toThrow(/absent/);
    expect(resolveAlias('canva')).toEqual([]);
    expect(searchMerchants('canva')).toEqual([]);
    expect(getMerchant('canva')).toBeUndefined();
  });
  it('preserves multiple legal entities in an ambiguous alias', () => {
    const matches = resolveAlias('google');
    expect(matches.length).toBeGreaterThan(1);
    expect(
      searchMerchants('google')
        .slice(0, matches.length)
        .map((merchant) => merchant.legalName),
    ).toEqual(matches);
  });
  it('accepts casing, typos and punctuation, and normalizes accents and legal suffixes', () => {
    expect(searchMerchants('NeTfLx')[0]?.slug).toBe('netflix');
    expect(normalizeName('Éxample, B.V. Ltd Inc.')).toBe('example b v ltd inc');
    expect(searchMerchants('NETFLIX INTERNATIONAL B.V.')[0]?.slug).toBe('netflix');
  });
  it('rejects malformed rows and duplicate legal identities', () => {
    expect(merchantsSchema.safeParse([...merchants, merchants[0]]).success).toBe(false);
    expect(merchantsSchema.safeParse([{ ...merchants[0], sourcePage: 0 }]).success).toBe(false);
  });
});

describe('PDF extraction safeguards', () => {
  it('joins wrapped legal names on the same page', () => {
    const lines = fixture();
    lines.splice(2, 0, { page: 1, text: 'INTERNATIONAL B.V.' });
    expect(parseMerchantLines(lines)[0]?.legalName).toBe(
      'Example Company 1 Ltd INTERNATIONAL B.V.',
    );
  });
  it('fails if required columns disappear', () => {
    expect(() => parseMerchantLines(fixture().slice(1))).toThrow(/column headers/);
  });
  it('fails on sharp row-count drops, skipped rows and broken TIN columns', () => {
    expect(() => parseMerchantLines(fixture().slice(0, 50))).toThrow(/dropped sharply/);
    const skipped = fixture();
    skipped.splice(10, 1);
    expect(() => parseMerchantLines(skipped)).toThrow(/Nonconsecutive/);
    const broken = fixture();
    broken[2] = { page: 1, text: '2 NoTIN Broken Name' };
    expect(() => parseMerchantLines(broken)).toThrow(/Unrecognised/);
  });
  it('fails instead of attaching an unknown row from a different page', () => {
    expect(() =>
      parseMerchantLines([...fixture(), { page: 2, text: 'UNKNOWN TABLE COLUMN' }]),
    ).toThrow(/Unrecognised/);
  });
});
