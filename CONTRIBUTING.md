# Contributing

Contributions should help people understand a payment without making stronger claims than the official evidence supports. Read [README.md](README.md), [docs/DATA.md](docs/DATA.md) and [docs/ASSUMPTIONS.md](docs/ASSUMPTIONS.md) before changing tax rules or merchant data.

## Development

Use Node 20.19+ and pnpm 9.15.9. Install with `pnpm install --frozen-lockfile`, then run `pnpm dev`. Before opening a pull request, run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` and `pnpm test:e2e`. Install Playwright Chromium with `pnpm exec playwright install chromium`. UI changes should include a mobile screenshot and keyboard/accessibility verification. Run `pnpm lighthouse` for changes that affect loading or page structure.

Keep changes focused. Write a clear problem statement, describe the resulting behavior, cite source evidence for tax claims, and report checks you actually ran. Do not report skipped checks as passing.

## Merchant corrections and aliases

Use the wrong-merchant or new-alias issue template. Include the exact legal name, source PDF page and dated evidence. An alias may target only legal entities present in the current extracted list. If one brand can map to multiple listed entities, preserve all supported mappings and let visitors choose. A name’s absence from the list does not prove that VAT is inapplicable.

Regenerate merchant data with the script rather than editing extracted legal names to match a brand. Review the source checksum, row count, wrapped rows and data diff. Include a regression test for an extraction or alias bug.

## Rules and calculations

Use the GRA FAQ and rate guidance as primary evidence. Cite the exact question/page or section. Record any unresolved interpretation in `docs/ASSUMPTIONS.md` and mark the corresponding code with `// ASSUMPTION:`. Do not add an exemption, refund deadline or collection rule without evidence. Money remains branded integer pesewas, including intermediate arithmetic. Add a meaningful edge-case or property test when changing financial logic.

## Language and accessibility

Use plain English. Twi strings need native-speaker review, especially terms describing tax collection, list status and uncertain outcomes. Preserve that review warning until a reviewer confirms it. Every interaction should work with a keyboard, expose useful accessible labels, and remain usable at 360px with visible focus and 44px touch targets. Do not rely on color alone.

## Privacy and security

Do not add trackers, remote fonts, statement uploads or data collection. Report security concerns using [SECURITY.md](SECURITY.md). Never paste passwords, payment credentials, complete statement data or private identity details into public issues.
