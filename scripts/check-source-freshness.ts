import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { downloadPdf, extractPdfLines, parseMerchantLines } from './build-merchants';
import { sourceMetaSchema } from '../lib/data-schema';

async function main(): Promise<void> {
  const meta = sourceMetaSchema.parse(
    JSON.parse(
      await readFile(fileURLToPath(new URL('../data/source-meta.json', import.meta.url)), 'utf8'),
    ),
  );
  try {
    const bytes = await downloadPdf(meta.merchantsPdfUrl);
    const actualSha256 = createHash('sha256').update(bytes).digest('hex');
    if (actualSha256 === meta.merchantsPdfSha256) {
      console.log(
        JSON.stringify({
          status: 'unchanged',
          url: meta.merchantsPdfUrl,
          expectedSha256: meta.merchantsPdfSha256,
          actualSha256,
        }),
      );
      return;
    }
    // A checksum change is actionable even if it is only PDF metadata. Never silently replace the reviewed list.
    const rows = parseMerchantLines(await extractPdfLines(bytes), meta.merchantCount);
    console.log(
      JSON.stringify({
        status: 'changed',
        url: meta.merchantsPdfUrl,
        expectedSha256: meta.merchantsPdfSha256,
        actualSha256,
        merchantCount: rows.length,
        message:
          'Official PDF changed. Regenerate data in a reviewed PR and inspect the source before release.',
      }),
    );
    process.exitCode = 2;
  } catch (error: unknown) {
    console.log(
      JSON.stringify({
        status: 'error',
        url: meta.merchantsPdfUrl,
        expectedSha256: meta.merchantsPdfSha256,
        message: error instanceof Error ? error.message : String(error),
      }),
    );
    process.exitCode = 1;
  }
}
main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
