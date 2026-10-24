import { z } from 'zod';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const merchantSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    legalName: z.string().min(2),
    tradingNames: z.array(z.string().min(1)),
    aliases: z.array(z.string().min(1)),
    country: z.string().min(2).optional(),
    sourcePage: z.number().int().positive(),
    sourceUrl: z.url(),
    sourceDate: isoDate,
  })
  .strict();
export type Merchant = z.infer<typeof merchantSchema>;
export const merchantsSchema = z
  .array(merchantSchema)
  .min(1)
  .superRefine((items, ctx) => {
    for (const field of ['slug', 'legalName'] as const) {
      const seen = new Set<string>();
      items.forEach((item, index) => {
        if (seen.has(item[field]))
          ctx.addIssue({
            code: 'custom',
            message: `Duplicate ${field}: ${item[field]}`,
            path: [index, field],
          });
        seen.add(item[field]);
      });
    }
  });
export const aliasesSchema = z.record(z.string().min(1), z.array(z.string().min(2)).min(1));
export const rateConfigSchema = z
  .object({
    version: z.string(),
    effectiveFrom: isoDate,
    reviewedAt: isoDate,
    vat: z.number().int().nonnegative(),
    nhil: z.number().int().nonnegative(),
    getfund: z.number().int().nonnegative(),
    method: z.literal('same-base-non-compounding'),
    roundingRule: z.literal('half-up-to-pesewa-largest-remainder'),
    rateUnit: z.literal('basis-points'),
    sourceUrl: z.url(),
    sourceReference: z.string(),
    faqUrl: z.url(),
    faqReference: z.string(),
  })
  .strict();
export const sourceMetaSchema = z
  .object({
    merchantsPdfUrl: z.url(),
    merchantsPdfSha256: z.string().regex(/^[a-f0-9]{64}$/),
    extractedAt: z.iso.datetime(),
    sourceDate: isoDate,
    merchantCount: z.number().int().positive(),
    faqUrl: z.url(),
    faqVersion: z.string(),
    verifiedAt: isoDate,
    ratesUrl: z.url(),
    kpmgUrl: z.url(),
  })
  .strict();
export type SourceMeta = z.infer<typeof sourceMetaSchema>;
export type RateConfig = z.infer<typeof rateConfigSchema>;
