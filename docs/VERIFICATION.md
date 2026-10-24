# Verification record

Checked on 24 October 2026 using a fresh copy, Node 22.23.4 and pnpm 9.15.9. These are measured local results for the repaired source. GitHub Actions results will be recorded after the source is pushed.

| Check                                                                             | Result                                                                                                                                                 |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Frozen install, official data rebuild/freshness, lint, types and production build | Pass                                                                                                                                                   |
| Unit tests                                                                        | 63 passed                                                                                                                                              |
| Browser tests                                                                     | 70 passed across desktop and 360px Chromium                                                                                                            |
| Independent tax oracle                                                            | 8,016 cases passed; five critical mutations detected and restored                                                                                      |
| Offline policy                                                                    | Five worker regressions pass; a real two-release test confirms waiting updates, retained form state, foreign-cache isolation and offline search/reload |
| Accessibility and layout                                                          | 126 axe scans with zero violations or overflow; 648 keyboard controls traversed, four focus restores and nine native 200% browser-zoom states          |
| Configured Lighthouse mobile checks                                               | All 24 runs pass: Performance 97–99, Accessibility 100, SEO 100                                                                                        |
| Remaining merchant-page Lighthouse coverage                                       | 91 additional runs pass: Performance 96–100, Accessibility 100, SEO 100                                                                                |
| Initial home JavaScript                                                           | 127,934 gzip bytes                                                                                                                                     |
| Dependency audit                                                                  | Zero registry advisories, without suppression                                                                                                          |
| Production notices                                                                | 70 package notices plus font attribution; generated and included in the static export                                                                  |

Coverage is deliberately scoped to core/data/extraction code: statements 198/245 (80.81%), branches 115/154 (74.67%), functions 41/49 (83.67%) and lines 179/219 (81.73%). React UI coverage is not included in these percentages.

## Sources and repairs

The source PDF still contains 92 merchants across four pages, dated 25 September 2026. Its SHA-256 is `9e7602521251b6dc7dd38e696ec24182544402975d8eb9273418f42159850eb3`. All rows are independently re-extracted in tests; ten seeded rows were also checked visually against the PDF. All 32 aliases retain dated primary evidence in [ALIASES.md](ALIASES.md).

The current pass repaired alias provenance, blocked-storage handling, language semantics, control targets, unnecessary prefetch, offline cache ownership and update staging, dependency versions, licence notices and CI action pins. Money and eligibility algorithms did not need changes.

The [GRA FAQ](https://gra.gov.gh/wp-content/uploads/2026/10/RTVAT-Approved-FAQ.pdf), questions 14–15, does not support treating registration as proof of tax inclusion. The app retains that qualification. [ASSUMPTIONS.md](ASSUMPTIONS.md) records the source interpretation, rounding convention and charge-screening limits.

## Limits

- Twi remains a labelled draft. Native-speaker review, spoken VoiceOver/NVDA testing, physical Android performance and actual mobile share delivery are unverified. Browser checks do not establish universal accessibility certification. Instrument Sans lacks some Twi glyphs, which use the local fallback font.
- Real bank/EMI payments, refunds and account-specific merchant arrangements are outside the app’s integrations. No payment or personal statement data was used in this audit.
- Source guidance can change. Follow [DATA.md](DATA.md) before releases; the scheduled checksum check does not discover every new source URL or re-review all guidance.
- Offline use requires successful installation and retained browser storage. Updates wait until existing tabs close. Saved pages can become stale, and external documents and images need a connection.
- Hosted CI, scheduled issue creation and actual production headers remain separate from local tests. Existing historical hosting was not updated by this audit. Private vulnerability reporting was verified enabled on GitHub on 24 October 2026.

Use [CONTRIBUTING.md](../CONTRIBUTING.md) to reproduce the checks. Report only checks actually completed for your revision.
