# Verification record

Status recorded on 23 October 2026. This report distinguishes completed checks from work still pending. The public repository is [KingEmma7/vat-check-gh](https://github.com/KingEmma7/vat-check-gh).

## Source data

The generated dataset contains **92 merchants**, **32 reviewed aliases** and **four source PDF pages**. The list date is **25 September 2026**, taken from the official filename. Download time and guidance review date are recorded separately in `data/source-meta.json`.

Official PDF SHA-256:

```text
9e7602521251b6dc7dd38e696ec24182544402975d8eb9273418f42159850eb3
```

The live-download builder completed successfully. After strengthening URL validation, a live freshness check again returned `unchanged` with the same checksum and exact final URL. Mocked regressions verify that a moved or redirected URL is flagged even when the PDF bytes are unchanged. Data validation checks every alias target, source attribution, row count and committed PDF checksum. A test independently re-extracts every legal name and page from the committed PDF and compares them with the generated JSON.

All four original PDF pages were rendered for visual inspection. For a reproducible random spot check, Python `random.Random(20261023).sample(range(92), 10)` selected the following ten rows. Each exact legal name and source page was then compared by eye with the original rendered PDF. All matched, including the source spellings “DOSCSIGIN” and “PARNER”, which were preserved. Earlier deliberate checks also covered rows 6, 12, 27, 35, 40, 56, 60, 70, 89 and 92, spanning all four pages.

| PDF row | PDF page | Exact legal name checked                    |
| ------- | -------- | ------------------------------------------- |
| 33      | 2        | FACEBOOK PAYMENTS INTERNATIONAL LIMITED     |
| 34      | 2        | FLUXX LABS, INC.                            |
| 26      | 1        | DOSCSIGIN INC                               |
| 69      | 3        | SITA SWITZERLAND SARL                       |
| 46      | 2        | LINKEDIN IRELAND UNLIMITED COMPANY          |
| 31      | 2        | EXPEDIA LODGING PARNER SERVICES SARL        |
| 74      | 3        | TALLY SOLUTIONS PRIVATE LIMITED             |
| 47      | 2        | LNRS DATA SERVICES LIMITED                  |
| 3       | 1        | ADG TECHNOLOGY INC                          |
| 53      | 2        | META PLATFORMS TECHNOLOGIES IRELAND LIMITED |

Netflix, ChatGPT/OpenAI and Spotify resolve to entities present in this snapshot. Canva has no registered alias. An unmatched search describes absence from the dated list and leaves transaction eligibility open.

## Source interpretation

The [GRA RTVAT FAQ](https://gra.gov.gh/wp-content/uploads/2026/10/RTVAT-Approved-FAQ.pdf), questions 14–15 on page 2, includes registered and unregistered suppliers and requires registered providers to display VAT-exclusive prices. The app therefore does not infer that a registered merchant has already included tax.

The [GRA VAT reforms guidance](https://gra.gov.gh/domestic-tax/tax-types/vat/) supplies the separate rates and common taxable base: VAT 15%, NHIL 2.5% and GETFund 2.5%, effective 1 January 2026. The [GRA RTVAT overview](https://gra.gov.gh/rtvat/) and [KPMG summary dated 21 October 2026](https://kpmg.com/us/en/taxnewsflash/news/2026/10/tnf-ghana-real-time-vat-collection-on-cross-border-digital-services.html) were also reviewed.

Every source decision and unresolved limit is recorded in [ASSUMPTIONS.md](ASSUMPTIONS.md). This includes pesewa rounding, the undated FAQ, filename-derived list date, aliases, uncertain eligibility, the charge-screening heuristic and its one-pesewa tolerance, FX, draft Twi and offline storage. Refresh instructions are in [DATA.md](DATA.md).

## Completed checks and pending checks

| Check                       | Recorded result                                                                                                                                                                                                                                                                                                                                            |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit and data tests         | 59 passed, including 17 source/parser/download tests.                                                                                                                                                                                                                                                                                                      |
| Property tests              | 6,000 generated cases passed: 3,000 tax round-trips and 3,000 sum/integer/inclusive invariants.                                                                                                                                                                                                                                                            |
| Eligibility combinations    | All 27 combinations of the three answers checked.                                                                                                                                                                                                                                                                                                          |
| Lint and TypeScript         | Passed in the final clean checkout.                                                                                                                                                                                                                                                                                                                        |
| Static export               | Passed in the final clean checkout, including the offline navigation fix and keyboard guard. The exported site was served for browser verification.                                                                                                                                                                                                        |
| Playwright and axe          | Final clean checkout: 66 cases passed across desktop Chromium and 360px mobile. All 88 axe scans passed with zero serious or critical violations: 32 route/language/view scans and 56 captured-state scans.                                                                                                                                                |
| Offline regression          | Passed on desktop and 360px mobile. The root-layout hook caches canonical HTML after client navigation, alongside newly loaded same-origin assets. The regression waits for that document to enter the cache before disabling the network and hard reloading.                                                                                              |
| Lighthouse mobile           | Passed all assertions across 27 mobile measurements: an eight-route, three-run matrix plus three final-build home repeats. The final home scores were 97/97/97 Performance, with Accessibility and SEO both 100. Every earlier route run also had Accessibility and SEO 100. See the route table below.                                                    |
| Clean-checkout verification | Passed: locked install, live source rebuild, lint, typecheck, 59 unit/data tests, static export, static serving and 66 browser checks. The live rebuild used `node --import tsx scripts/build-merchants.ts`, the equivalent data-builder entry point, and reproduced all 92 merchants and the committed checksum after an initial transient fetch failure. |
| GitHub CI                   | Workflow files exist. The current revision has not yet been pushed, so no GitHub Actions pass is claimed.                                                                                                                                                                                                                                                  |
| Deployment                  | Pending. The deployed URL and hosting-header verification must be recorded after publication.                                                                                                                                                                                                                                                              |

Browser coverage includes both language settings, serious/critical axe checks, no-overflow checks, keyboard search, all main routes, JavaScript-disabled merchant content, real multi-entity aliases, charge comparisons, share-image download, local-only asset requests and visited-page offline use. Screenshot captures cover the main screens and interaction states. A passing browser suite does not establish native-language accuracy.

## Lighthouse mobile results

Lighthouse 12.6.1 completed 27 measurements: three runs for each of eight route classes, followed by three final-build home repeats after the combobox keyboard guard. All assertions passed. The final home runs were 97/97/97 for Performance and 100/100 for Accessibility/SEO in each run. The other seven route measurements are unchanged from the complete matrix. These are local static-export lab results, not measurements of a Ghanaian mobile network or the hosting login page. The table uses the final home repeat; the earlier home baseline was 96–97.

| Route             | Median performance | Range | Accessibility | SEO |
| ----------------- | -----------------: | ----- | ------------: | --: |
| Home              |                 97 | 97    |           100 | 100 |
| Calculator        |                 98 | 98    |           100 | 100 |
| Eligibility       |                 99 | 99    |           100 | 100 |
| FAQ               |                 99 | 99    |           100 | 100 |
| About             |                 98 | 98–99 |           100 | 100 |
| Charge comparison |                 99 | 99    |           100 | 100 |
| Netflix result    |                 98 | 97–98 |           100 | 100 |
| Canva result      |                 98 | 98    |           100 | 100 |

## Three calculator examples checked by hand

1. **GH₵100.00 before tax:** VAT is GH₵15.00, NHIL GH₵2.50 and GETFund GH₵2.50. Total tax is GH₵20.00 and the total payment is **GH₵120.00**.
2. **GH₵120.00 including tax:** divide the total by 1.20 to obtain a GH₵100.00 base. The same GH₵15.00, GH₵2.50 and GH₵2.50 components sum to GH₵20.00 tax, preserving the **GH₵120.00** input.
3. **GH₵99.99 before tax:** unrounded combined tax is GH₵19.998, rounded half up to GH₵20.00. Component allocation yields VAT GH₵15.00, NHIL GH₵2.50 and GETFund GH₵2.50. The total is **GH₵119.99**. Component rounding follows the documented app convention, since the reviewed sources do not prescribe operational pesewa rounding.

## Runtime and release limits

Use Node **22.13 or newer in a supported even-numbered release**, with Node 24 recommended, and pnpm 9.15.9. Current PDF.js and Vitest releases require a newer runtime than Node 20. The lockfile pins the installed dependency graph.

Twi remains a clearly flagged draft requiring native-speaker review. Detailed guidance is still partly in English. No native-language approval is claimed.

The weekly freshness workflow checks the known merchant PDF URL and opens or updates an issue for a changed checksum or retrieval failure. It does not detect a newer document published only at a different URL and does not automatically re-verify the FAQ or rate guidance. Maintainers must inspect the official RTVAT page, review the guidance and re-run the data build before release.

Offline access depends on an initial successful visit, service-worker installation and browser storage retention. Provider fees, conversion and unsettled payments can prevent a numerical comparison from establishing whether a charge is correct. The FAQ gives no guaranteed refund timetable.

Private vulnerability reporting is enabled for the repository. Public GitHub CI results and deployment verification remain pending and must be added to this record when available.
