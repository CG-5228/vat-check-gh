import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import aliases from '../data/aliases.json';
import evidence from '../data/alias-evidence.json';
import { validateAliasEvidence } from '../lib/alias-provenance';

describe('reviewed provider alias evidence', () => {
  it('validates the reviewed records used by both data generation and production builds', () => {
    expect(() => validateAliasEvidence(aliases, evidence)).not.toThrow();
  });
  it('rejects missing or orphaned evidence and changed legal targets', () => {
    const missing = { ...evidence } as Record<string, unknown>;
    delete missing.chatgpt;
    expect(() => validateAliasEvidence(aliases, missing)).toThrow(/keys differ/);
    expect(() => validateAliasEvidence(aliases, { ...evidence, absent: evidence.chatgpt })).toThrow(
      /keys differ/,
    );
    expect(() =>
      validateAliasEvidence(aliases, {
        ...evidence,
        chatgpt: { ...evidence.chatgpt, legalNames: ['Different company'] },
      }),
    ).toThrow(/targets differ/);
  });
  it('rejects impossible review dates, insecure links and unsupported product associations', () => {
    expect(() =>
      validateAliasEvidence(aliases, {
        ...evidence,
        chatgpt: { ...evidence.chatgpt, reviewedAt: '2026-02-30' },
      }),
    ).toThrow();
    expect(() =>
      validateAliasEvidence(aliases, {
        ...evidence,
        chatgpt: { ...evidence.chatgpt, sourceUrls: ['http://openai.com/'] },
      }),
    ).toThrow();
    expect(() =>
      validateAliasEvidence(aliases, {
        ...evidence,
        chatgpt: { ...evidence.chatgpt, sourceUrls: ['https://gra.gov.gh/'] },
      }),
    ).toThrow(/provider evidence/);
  });
  it('retains dated primary evidence for every public alias and exact target', () => {
    const evidence = JSON.parse(
      readFileSync(new URL('../data/alias-evidence.json', import.meta.url), 'utf8'),
    ) as Record<string, { legalNames: string[]; reviewedAt: string; sourceUrls: string[] }>;
    expect(Object.keys(evidence).sort()).toEqual(Object.keys(aliases).sort());
    for (const [alias, targets] of Object.entries(aliases)) {
      const record = evidence[alias];
      expect(record, `Missing primary evidence for ${alias}`).toBeDefined();
      expect(record?.legalNames).toEqual(targets);
      expect(record?.reviewedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(record?.sourceUrls.length).toBeGreaterThan(0);
      for (const url of record?.sourceUrls ?? []) expect(new URL(url).protocol).toBe('https:');
    }
  });
});
