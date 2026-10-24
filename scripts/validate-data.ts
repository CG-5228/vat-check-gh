import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { validateAliasEvidence } from '../lib/alias-provenance';
import {
  aliasesSchema,
  merchantsSchema,
  rateConfigSchema,
  sourceMetaSchema,
} from '../lib/data-schema';

const data = new URL('../data/', import.meta.url);
async function json(name: string): Promise<unknown> {
  return JSON.parse(await readFile(new URL(name, data), 'utf8')) as unknown;
}
async function main(): Promise<void> {
  const merchants = merchantsSchema.parse(await json('merchants.json'));
  const aliases = aliasesSchema.parse(await json('aliases.json'));
  validateAliasEvidence(aliases, await json('alias-evidence.json'));
  const rates = rateConfigSchema.parse(await json('rates.json'));
  const meta = sourceMetaSchema.parse(await json('source-meta.json'));
  if (meta.merchantCount !== merchants.length)
    throw new Error('Merchant metadata count differs from dataset.');
  const pdf = await readFile(new URL('sources/merchants.pdf', data));
  const actual = createHash('sha256').update(pdf).digest('hex');
  if (actual !== meta.merchantsPdfSha256)
    throw new Error('Committed PDF checksum does not match source metadata.');
  if (!(await readFile(new URL('sources/merchants.pdf.sha256', data), 'utf8')).startsWith(actual))
    throw new Error('Checksum file differs from PDF.');
  const legalNames = new Set(merchants.map((item) => item.legalName));
  for (const [alias, names] of Object.entries(aliases))
    for (const name of names) {
      if (!legalNames.has(name)) throw new Error(`Alias ${alias} points to absent entity ${name}.`);
      const merchant = merchants.find((item) => item.legalName === name);
      if (!merchant?.aliases.includes(alias))
        throw new Error(`Generated merchant aliases stale for ${alias}. Run data:build.`);
    }
  for (const merchant of merchants) {
    if (merchant.sourceDate !== meta.sourceDate || merchant.sourceUrl !== meta.merchantsPdfUrl)
      throw new Error(`Stale source attribution: ${merchant.legalName}`);
    for (const alias of merchant.aliases)
      if (!aliases[alias]?.includes(merchant.legalName))
        throw new Error(`Orphan generated alias: ${alias}`);
  }
  if (rates.vat + rates.nhil + rates.getfund !== 2000)
    throw new Error('Rate total differs from RTVAT FAQ Q9. Review versioned sources.');
  console.log(
    `Validated ${merchants.length} merchants, ${Object.keys(aliases).length} aliases, rate config ${rates.version}, and PDF checksum.`,
  );
}
main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
