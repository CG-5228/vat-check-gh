import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  aliasesSchema,
  merchantsSchema,
  sourceMetaSchema,
  type Merchant,
} from '../lib/data-schema';

export const MERCHANTS_URL =
  'https://gra.gov.gh/wp-content/uploads/2026/10/REGISTERED_NON-RESIDENT_MERCHANTS_UPDATED_25.9.2026.pdf';
export const FAQ_URL = 'https://gra.gov.gh/wp-content/uploads/2026/10/RTVAT-Approved-FAQ.pdf';
// ASSUMPTION: this PDF has no printed revision date. Use the official filename's 25.9.2026 date, not download time.
const SOURCE_DATE = '2026-09-25';
export interface PdfLine {
  page: number;
  text: string;
}
interface Row {
  number: number;
  tin: string;
  legalName: string;
  page: number;
}
export function parseMerchantLines(lines: readonly PdfLine[], previousCount = 92): Row[] {
  if (!lines.some((line) => /NO\.?\s+TIN\s+NAME OF NON.?RESIDENT MERCHANT/i.test(line.text))) {
    throw new Error(
      'Official PDF column headers changed. Expected NO., TIN and NAME OF NON RESIDENT MERCHANT. Review manually.',
    );
  }
  const rows: Row[] = [];
  for (const line of lines) {
    const text = line.text.normalize('NFKC').replace(/\s+/g, ' ').trim();
    if (!text || /LIST OF ACTIVE|^NO\.?\s+TIN|^Page \d|^\d+\s*\/\s*\d+$/i.test(text)) continue;
    const match = /^(\d{1,4})\s+([BV][0-9A-Z]{9,11})\s+(.+)$/.exec(text);
    if (match) {
      const number = Number(match[1]);
      const tin = match[2];
      const legalName = match[3];
      if (!tin || !legalName) throw new Error(`Broken row on page ${line.page}: ${text}`);
      if (number !== rows.length + 1)
        throw new Error(
          `Nonconsecutive PDF row ${number}, expected ${rows.length + 1}. Possible broken or missing row.`,
        );
      rows.push({ number, tin, legalName, page: line.page });
    } else {
      const previous = rows.at(-1);
      // Wrapped names are allowed only immediately after an identified row on the same page.
      if (!previous || previous.page !== line.page || /^\d|\b[BV]\d{8}/.test(text)) {
        throw new Error(
          `Unrecognised PDF row on page ${line.page}: ${text}. Refusing to publish partial data.`,
        );
      }
      previous.legalName += ` ${text}`;
    }
  }
  if (rows.length < Math.max(70, Math.ceil(previousCount * 0.85))) {
    throw new Error(
      `Merchant count dropped sharply: ${previousCount} to ${rows.length}. Review the PDF before changing the baseline.`,
    );
  }
  if (new Set(rows.map((row) => row.tin)).size !== rows.length)
    throw new Error('Duplicate TINs in extracted PDF.');
  if (new Set(rows.map((row) => row.legalName)).size !== rows.length)
    throw new Error('Duplicate legal names in extracted PDF.');
  return rows;
}
export async function extractPdfLines(bytes: Uint8Array): Promise<PdfLine[]> {
  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const loadingTask = getDocument({ data: new Uint8Array(bytes), useSystemFonts: true });
  const pdf = await loadingTask.promise;
  const lines: PdfLine[] = [];
  for (let number = 1; number <= pdf.numPages; number += 1) {
    const page = await pdf.getPage(number);
    const content = await page.getTextContent();
    const grouped: { y: number; cells: { x: number; text: string }[] }[] = [];
    for (const item of content.items) {
      if (!('str' in item) || !item.str.trim()) continue;
      const y = item.transform[5] ?? 0;
      const x = item.transform[4] ?? 0;
      let group = grouped.find((existing) => Math.abs(existing.y - y) < 2);
      if (!group) {
        group = { y, cells: [] };
        grouped.push(group);
      }
      group.cells.push({ x, text: item.str });
    }
    for (const group of grouped.sort((a, b) => b.y - a.y)) {
      lines.push({
        page: number,
        text: group.cells
          .sort((a, b) => a.x - b.x)
          .map((cell) => cell.text)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim(),
      });
    }
  }
  await loadingTask.destroy();
  return lines;
}
function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
const canonical: Readonly<Record<string, { slug: string; name: string }>> = {
  'NETFLIX INTERNATIONAL B.V.': { slug: 'netflix', name: 'Netflix' },
  'OPENAI OPCO, LLC': { slug: 'chatgpt', name: 'ChatGPT / OpenAI' },
  'SPOTIFY AB': { slug: 'spotify', name: 'Spotify' },
  'APPLE DISTRIBUTION INTERNATIONAL': { slug: 'apple', name: 'Apple / iCloud' },
  'ADOBE SYSTEMS SOFTWARE IRELAND LIMITED': { slug: 'adobe', name: 'Adobe' },
};
export async function downloadPdf(url: string): Promise<Uint8Array> {
  const requestedUrl = new URL(url).href;
  const response = await fetch(requestedUrl, {
    signal: AbortSignal.timeout(60000),
    redirect: 'follow',
  });
  if (!response.ok)
    throw new Error(`Official PDF request failed: HTTP ${response.status} at ${url}`);
  if (response.redirected || new URL(response.url).href !== requestedUrl)
    throw new Error(
      `Official PDF URL moved: requested ${requestedUrl}, received ${response.url}. Review the official source and update its URL before refreshing.`,
    );
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (new TextDecoder().decode(bytes.subarray(0, 5)) !== '%PDF-')
    throw new Error(
      'Official URL no longer returns a PDF. It may have moved or returned an error page.',
    );
  return bytes;
}
async function main(): Promise<void> {
  const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
  const args = process.argv.slice(2);
  const localIndex = args.indexOf('--pdf');
  const file = localIndex >= 0 ? args[localIndex + 1] : undefined;
  if (localIndex >= 0 && !file) throw new Error('--pdf requires a local official PDF path.');
  const bytes = file
    ? new Uint8Array(await readFile(resolve(file)))
    : await downloadPdf(MERCHANTS_URL);
  const aliasMap = aliasesSchema.parse(
    JSON.parse(await readFile(resolve(root, 'data/aliases.json'), 'utf8')),
  );
  let previousCount = 92;
  try {
    previousCount = (
      JSON.parse(await readFile(resolve(root, 'data/merchants.json'), 'utf8')) as unknown[]
    ).length;
  } catch {
    /* First generation uses the reviewed 92-row baseline. */
  }
  const rows = parseMerchantLines(await extractPdfLines(bytes), previousCount);
  const names = new Set(rows.map((row) => row.legalName));
  for (const [alias, targets] of Object.entries(aliasMap)) {
    for (const target of targets)
      if (!names.has(target))
        throw new Error(
          `Alias ${alias} points to missing legal entity ${target}. Review aliases before refreshing.`,
        );
  }
  const merchants: Merchant[] = rows.map((row) => ({
    slug: canonical[row.legalName]?.slug ?? slugify(row.legalName),
    legalName: row.legalName,
    tradingNames: canonical[row.legalName]?.name
      ? [canonical[row.legalName]?.name ?? row.legalName]
      : [],
    aliases: Object.entries(aliasMap)
      .filter(([, targets]) => targets.includes(row.legalName))
      .map(([alias]) => alias),
    sourcePage: row.page,
    sourceUrl: MERCHANTS_URL,
    sourceDate: SOURCE_DATE,
  }));
  merchantsSchema.parse(merchants);
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  // ASSUMPTION: the FAQ is undated; its October 2026 label identifies the official upload path only.
  const metadata = sourceMetaSchema.parse({
    merchantsPdfUrl: MERCHANTS_URL,
    merchantsPdfSha256: sha256,
    extractedAt: new Date().toISOString(),
    sourceDate: SOURCE_DATE,
    merchantCount: merchants.length,
    faqUrl: FAQ_URL,
    faqVersion: 'RTVAT Approved FAQ, undated, October 2026 upload path, 3 pages',
    verifiedAt: '2026-10-23',
    ratesUrl: 'https://gra.gov.gh/domestic-tax/tax-types/vat/',
    kpmgUrl:
      'https://kpmg.com/us/en/taxnewsflash/news/2026/10/tnf-ghana-real-time-vat-collection-on-cross-border-digital-services.html',
  });
  // Validate every output before replacing any published data. Keep the original PDF for audit and offline regeneration.
  await mkdir(resolve(root, 'data/sources'), { recursive: true });
  const outputs: [string, string | Uint8Array][] = [
    ['data/merchants.json', JSON.stringify(merchants, null, 2) + '\n'],
    ['data/source-meta.json', JSON.stringify(metadata, null, 2) + '\n'],
    ['data/sources/merchants.pdf.sha256', `${sha256}  merchants.pdf\n`],
    ['data/sources/merchants.pdf', bytes],
  ];
  for (const [path, value] of outputs) await writeFile(resolve(root, `${path}.tmp`), value);
  for (const [path] of outputs) await rename(resolve(root, `${path}.tmp`), resolve(root, path));
  console.log(`Generated ${merchants.length} merchants from ${SOURCE_DATE}. SHA-256: ${sha256}`);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
