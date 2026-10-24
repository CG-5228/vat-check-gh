# Data provenance and refresh

The committed dataset contains 92 active registered digital service providers extracted from the [official GRA merchant PDF](https://gra.gov.gh/wp-content/uploads/2026/10/REGISTERED_NON-RESIDENT_MERCHANTS_UPDATED_25.9.2026.pdf). The filename gives the source date, 25 September 2026. Download time is a separate `extractedAt` timestamp. The PDF has four pages and columns for row number, TIN and legal name. It contains no country or trading-name columns; these are not inferred. TINs are used for extraction validation and not published in the site dataset.

`data/sources/merchants.pdf` is the unmodified official source. Its SHA-256 is committed in `data/sources/merchants.pdf.sha256` and `data/source-meta.json`. Generated rows retain the exact legal-name spelling and punctuation after whitespace normalization, along with the one-based source page, URL and date.

## Refresh

1. Install Node 22.13 or newer in a supported even-numbered release (Node 24 recommended) and pnpm 9.15.9, then run `pnpm install --frozen-lockfile`.
2. Run `pnpm data:build`. This downloads the official source over HTTPS, extracts its text with pdfjs-dist and validates every row and alias before replacing generated files. Expected current output: `Generated 92 merchants from 2026-09-25` plus the SHA-256.
3. If working without network access, run `pnpm data:build --pdf data/sources/merchants.pdf` to regenerate from the committed source. This does not check whether GRA has changed its website.
4. Review the JSON diff and visually compare ten randomly chosen rows with the original PDF, including every changed alias. Run `pnpm test`, `pnpm typecheck`, `pnpm lint` and `pnpm build`.
5. If GRA publishes a new filename or dated version, update `MERCHANTS_URL` and `SOURCE_DATE` in `scripts/build-merchants.ts`, review the baseline, regenerate and update the release date.
6. After actually reviewing the current FAQ and rate guidance, update `GUIDANCE_VERIFIED_AT` in the generator and `reviewedAt` in `data/rates.json`. Downloading the merchant PDF alone does not establish a new tax-guidance review date.
7. Submit all changes together in a PR. Re-run data:build and update the data date before each release.

A moved URL, HTTP failure, HTML response, redirect or changed final URL (including on the same domain), missing column headers, missing row numbers, malformed TIN, duplicate row/TIN/name, or extraction count falling below 85% of the previous count fails loudly. The initial minimum is 70 rows against the reviewed 92-row baseline. A change in official layout requires human review rather than relaxing validation automatically. Continuation lines are joined only to the previous row on the same page.

`pnpm data:check` checks the source checksum without modifying any committed data. Exit code 0 means unchanged; 2 means the official PDF changed and needs a reviewed refresh; 1 means retrieval or parsing failed. The weekly CI workflow opens or updates an issue for a change or source error. A checksum cannot detect a newer file published only at a different URL, so also inspect the official RTVAT page before a release.

## Aliases

`data/aliases.json` is a hand-reviewed map from brand labels to arrays of exact legal names in the PDF. Never map to an absent entity. Arrays preserve ambiguity, for example Google, Amazon and Audible. Search shows all matching entities so the user can compare the name on their receipt. Product aliases identify a possible listed supplier, not a guarantee that every payment for that brand is supplied by that entity or is a taxable digital service. The actual receipt takes precedence. Netflix, ChatGPT/OpenAI and Spotify are present in the reviewed source. Canva is absent; no alias or fabricated registered page is created.

Every alias also requires a matching dated record in `data/alias-evidence.json`; both `data:build` and the production validation step reject missing evidence, changed targets and product associations supported only by the legal-name list. The validator checks record completeness, not whether a web page proves a claim. Maintainers must read the primary sources and retain their scope. See [ALIASES.md](ALIASES.md).

Only recognizable labels are used. Do not infer a company country from its legal suffix, correct apparent source misspellings, treat registration as proof that a particular transaction qualifies, or infer tax inclusion from registration.

## Source interpretation

The [GRA RTVAT FAQ](https://gra.gov.gh/wp-content/uploads/2026/10/RTVAT-Approved-FAQ.pdf) is the primary source for eligibility, collection and refund steps. The [GRA VAT reforms page](https://gra.gov.gh/domestic-tax/tax-types/vat/) supplies the separate levy rates and the common taxable base. The [KPMG summary](https://kpmg.com/us/en/taxnewsflash/news/2026/10/tnf-ghana-real-time-vat-collection-on-cross-border-digital-services.html) corroborates the change in collection and highlights uncertainties. See `ASSUMPTIONS.md` before changing any outcome copy.
