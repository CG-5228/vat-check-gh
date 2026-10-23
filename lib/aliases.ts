import rawAliases from '../data/aliases.json';
import type { Merchant } from './data-schema';

export const aliases: Readonly<Record<string, readonly string[]>> = rawAliases;
export function normalizeName(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}
export function resolveAlias(query: string): string[] {
  const match = Object.entries(aliases).find(
    ([alias]) => normalizeName(alias) === normalizeName(query),
  );
  return [...(match?.[1] ?? [])];
}
export function validateAliases(items: readonly Pick<Merchant, 'legalName'>[]): void {
  const legalNames = new Set(items.map((item) => item.legalName));
  for (const [alias, names] of Object.entries(aliases)) {
    for (const name of names) {
      if (!legalNames.has(name))
        throw new Error(
          `Alias ${alias} references a legal entity absent from the official list: ${name}`,
        );
    }
  }
}
