# Data provenance and refresh

The committed dataset contains 92 active registered digital service providers extracted from the [official GRA merchant PDF](https://gra.gov.gh/wp-content/uploads/2026/10/REGISTERED_NON-RESIDENT_MERCHANTS_UPDATED_25.9.2026.pdf). The filename gives the source date, 25 September 2026. Download time is a separate `extractedAt` timestamp. The PDF has four pages and columns for row number, TIN and legal name. It contains no country or trading-name columns; these are not inferred. TINs are used for extraction validation and not published in the site dataset.

`data/sources/merchants.pdf` is the unmodified official source. Its SHA-256 is committed in `data/sources/merchants.pdf.sha256` and `data/source-meta.json`. Generated rows retain the exact legal-name spelling and punctuation after whitespace normalization, along with the one-based source page, URL and date.

## Refresh

1. Install Node 22.19 or newer in a supported even-numbered release (Node 24 recommended) and pnpm 9.15.9, then run `pnpm install --frozen-lockfile`.
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

## Worked review example (fictional)

The snippets below use **fictional** companies (`EXAMPLE STREAMING B.V.`, `NORTHWIND CLOUD SERVICES LIMITED`) to show how a maintainer inspects a refresh without altering the committed 92-merchant dataset or `data/sources/merchants.pdf`.

### 1. Inspect metadata, checksum, row count and pages

After `pnpm data:check` exits with `2` (or GRA publishes a newly dated PDF URL in `scripts/build-merchants.ts`) and `pnpm data:build` runs, inspect `data/source-meta.json` and `data/sources/merchants.pdf.sha256` first:

```diff
--- a/data/source-meta.json
+++ b/data/source-meta.json
@@ -1,7 +1,7 @@
 {
   "merchantsPdfUrl": "https://gra.gov.gh/wp-content/uploads/2026/10/REGISTERED_NON-RESIDENT_MERCHANTS_UPDATED_25.9.2026.pdf",
-  "merchantsPdfSha256": "1111111111111111111111111111111111111111111111111111111111111111",
-  "extractedAt": "2026-10-24T00:00:00.000Z",
+  "merchantsPdfSha256": "2222222222222222222222222222222222222222222222222222222222222222",
+  "extractedAt": "2026-11-02T09:15:00.000Z",
   "sourceDate": "2026-09-25",
-  "merchantCount": 92,
+  "merchantCount": 93,
```

- Confirm `data/sources/merchants.pdf.sha256` starts with the same 64-character hex digest stored in `data/source-meta.json` (`merchantsPdfSha256`). `scripts/validate-data.ts` (run during `pnpm build`) verifies both against `data/sources/merchants.pdf`.
- Confirm `merchantCount` matches the array length in `data/merchants.json` and that `sourceDate` comes from the official PDF filename rather than the download timestamp (`extractedAt`). Keep `verifiedAt` (`GUIDANCE_VERIFIED_AT` in `scripts/build-merchants.ts`) and `reviewedAt` in `data/rates.json` unchanged unless you also re-reviewed the RTVAT FAQ and VAT rate guidance.
- Spot-check ten random rows plus every changed row against `data/sources/merchants.pdf`, confirming the one-based `sourcePage` (`1` to `4` in the current PDF) matches the page where the numbered row appears.

### 2. Review a changed legal name and a new row

Suppose the fictional PDF renames an existing registrant on page 2 and adds a 93rd registrant on page 4:

```diff
--- a/data/merchants.json
+++ b/data/merchants.json
@@ -120,8 +120,8 @@
   {
-    "slug": "example-streaming-b-v",
-    "legalName": "EXAMPLE STREAMING B.V.",
+    "slug": "example-streaming-europe-b-v",
+    "legalName": "EXAMPLE STREAMING EUROPE B.V.",
     "tradingNames": [],
     "aliases": ["example streaming", "exampleplus"],
     "sourcePage": 2,
     "sourceUrl": "https://gra.gov.gh/wp-content/uploads/2026/10/REGISTERED_NON-RESIDENT_MERCHANTS_UPDATED_25.9.2026.pdf",
     "sourceDate": "2026-09-25"
   },
+  {
+    "slug": "northwind-cloud-services-limited",
+    "legalName": "NORTHWIND CLOUD SERVICES LIMITED",
+    "tradingNames": [],
+    "aliases": [],
+    "sourcePage": 4,
+    "sourceUrl": "https://gra.gov.gh/wp-content/uploads/2026/10/REGISTERED_NON-RESIDENT_MERCHANTS_UPDATED_25.9.2026.pdf",
+    "sourceDate": "2026-09-25"
+  }
```

- **Changed legal name (`EXAMPLE STREAMING B.V.` -> `EXAMPLE STREAMING EUROPE B.V.`)**: Verify on PDF page 2 that the change reflects the official `NAME OF NON RESIDENT MERCHANT` column after whitespace normalization, not a manual edit to match a consumer brand. Unless the entity is in the `canonical` map in `scripts/build-merchants.ts`, `slug` updates automatically from `legalName` (`example-streaming-b-v` -> `example-streaming-europe-b-v`) and `tradingNames` stays `[]` (alias evidence populates `aliases`, not `tradingNames`). Because `data/aliases.json` and `data/alias-evidence.json` match exact `legalName` strings, any alias still pointing to `"EXAMPLE STREAMING B.V."` fails validation (`Alias ... points to missing legal entity ...`) until updated to `"EXAMPLE STREAMING EUROPE B.V."` after checking that the existing evidence still applies to that legal entity.
- **New row (`NORTHWIND CLOUD SERVICES LIMITED`)**: Verify on PDF page 4 that the row number (`NO.`) is consecutive, the TIN column was present in the PDF (validated during extraction by `parseMerchantLines` in `scripts/build-merchants.ts` and intentionally omitted from `data/merchants.json`), `sourcePage` is the one-based PDF page (`4`), and `tradingNames` and `aliases` remain `[]` unless separate alias evidence is added. Do not infer a `country` field from `LIMITED` or `B.V.`.
- **Removed or absent rows**: If a company disappears from a newer PDF or has never been listed, do not keep a stale entry or point an alias at an unlisted name. Absence from the dated GRA list only means there is no match in this snapshot; it does not prove that a supplier or transaction is tax-exempt or unregistered today.

### 3. Review an alias requiring new primary evidence

Adding a fictional product alias `exampleplus` (or updating targets after a legal-name change) requires synchronized edits to `data/aliases.json`, `data/alias-evidence.json` and [ALIASES.md](ALIASES.md) before running `pnpm data:build`:

```diff
--- a/data/aliases.json
+++ b/data/aliases.json
@@ -1,4 +1,6 @@
 {
+  "example streaming": ["EXAMPLE STREAMING EUROPE B.V."],
+  "exampleplus": ["EXAMPLE STREAMING EUROPE B.V."],
   "netflix": ["NETFLIX INTERNATIONAL B.V."],
```

```diff
--- a/data/alias-evidence.json
+++ b/data/alias-evidence.json
@@ -1,4 +1,22 @@
 {
+  "example streaming": {
+    "legalNames": ["EXAMPLE STREAMING EUROPE B.V."],
+    "reviewedAt": "2026-11-02",
+    "sourceUrls": [
+      "https://gra.gov.gh/wp-content/uploads/2026/10/REGISTERED_NON-RESIDENT_MERCHANTS_UPDATED_25.9.2026.pdf#page=2"
+    ],
+    "basis": "legal-name-search-label",
+    "note": "Search label derived from the listed legal name; it does not certify the seller or tax treatment of an individual purchase."
+  },
+  "exampleplus": {
+    "legalNames": ["EXAMPLE STREAMING EUROPE B.V."],
+    "reviewedAt": "2026-11-02",
+    "sourceUrls": [
+      "https://gra.gov.gh/wp-content/uploads/2026/10/REGISTERED_NON-RESIDENT_MERCHANTS_UPDATED_25.9.2026.pdf#page=2",
+      "https://example.com/legal/terms"
+    ],
+    "basis": "product-association",
+    "note": "Fictional ExamplePlus terms identify Example Streaming Europe B.V. for EMEA subscribers; the customer receipt governs the actual seller."
+  },
```

- **Automated checks vs manual review**: `validateAliasEvidence` in `lib/alias-provenance.ts` automatically checks that every alias key and `legalNames` target array in `data/aliases.json` matches `data/alias-evidence.json`, all `sourceUrls` use `https:`, and every `"product-association"` record includes at least one URL with a non-`gra.gov.gh` hostname. The maintainer still needs to manually verify that the cited provider URL has authority for that product/entity and that the `#page=` link points to the correct one-based GRA PDF page.
- Keep the `note` factual about which contracting entity the provider page names and its regional or plan limits; do not invent taxability, collection or refund rules. If multiple listed legal entities share a brand, include all of them in `legalNames` so search results preserve every candidate for receipt comparison.

### 4. When to stop for manual review

Stop the refresh and investigate manually rather than weakening checks or editing `data/merchants.json` by hand if any of the following occur:

- `pnpm data:check` or `pnpm data:build` reports an HTTP redirect or final URL change (even on `gra.gov.gh`), which indicates GRA moved or replaced the file path.
- `parseMerchantLines` fails on missing `NO. TIN NAME OF NON RESIDENT MERCHANT` headers, nonconsecutive row numbers, a missing or malformed TIN, duplicate row numbers/TINs/legal names, or an unrecognised line at the top of a new page (wrapped legal names are joined only to the preceding row on the same page).
- The extracted merchant count drops below 85% of the baseline count (or below the 70-row minimum floor): `pnpm data:check` compares against `merchantCount` in `data/source-meta.json`, whereas `pnpm data:build` compares against the existing `data/merchants.json` dataset length.
- A provider terms page names only a regional contracting entity that is not present in the GRA PDF; do not substitute the unlisted entity into `data/aliases.json` or `data/merchants.json`.

## Source interpretation

The [GRA RTVAT FAQ](https://gra.gov.gh/wp-content/uploads/2026/10/RTVAT-Approved-FAQ.pdf) is the primary source for eligibility, collection and refund steps. The [GRA VAT reforms page](https://gra.gov.gh/domestic-tax/tax-types/vat/) supplies the separate levy rates and the common taxable base. The [KPMG summary](https://kpmg.com/us/en/taxnewsflash/news/2026/10/tnf-ghana-real-time-vat-collection-on-cross-border-digital-services.html) corroborates the change in collection and highlights uncertainties. See `ASSUMPTIONS.md` before changing any outcome copy.
