import { z } from 'zod';

const evidenceSchema = z.record(
  z.string().min(1),
  z
    .object({
      legalNames: z.array(z.string().min(2)).min(1),
      reviewedAt: z.iso.date(),
      sourceUrls: z.array(z.url({ protocol: /^https$/ })).min(1),
      basis: z.enum(['legal-name-search-label', 'product-association']),
      note: z.string().min(20),
    })
    .strict(),
);

/** Maintainer-only validation. Source review remains a human responsibility. */
export function validateAliasEvidence(
  aliases: Readonly<Record<string, readonly string[]>>,
  input: unknown,
): void {
  const evidence = evidenceSchema.parse(input);
  const keys = Object.keys(aliases).sort();
  if (JSON.stringify(keys) !== JSON.stringify(Object.keys(evidence).sort()))
    throw new Error(
      'Alias evidence keys differ from aliases. Review every added or removed alias.',
    );
  for (const alias of keys) {
    const record = evidence[alias];
    if (!record || JSON.stringify(record.legalNames) !== JSON.stringify(aliases[alias]))
      throw new Error(
        `Alias evidence targets differ for ${alias}. Review the exact legal entities.`,
      );
    if (
      record.basis === 'product-association' &&
      record.sourceUrls.every((url) => new URL(url).hostname === 'gra.gov.gh')
    )
      throw new Error(
        `Product alias ${alias} needs primary provider evidence beyond the GRA legal-name list.`,
      );
  }
}
