# Security policy

VAT Check GH is a static app. It should not collect payment credentials, statement files or personal financial data. A security issue can still expose visitors through unsafe rendering, compromised dependencies, misleading source data or weakened hosting policy.

## Reporting

Private vulnerability reporting is enabled for [KingEmma7/vat-check-gh](https://github.com/KingEmma7/vat-check-gh/security). Use its **Report a vulnerability** action to contact the maintainer privately. Do not disclose an exploit, personal data or credentials in a public issue.

Include the affected revision, steps to reproduce, expected and observed behavior, and the likely impact. Redact financial and personal information. Maintainers should acknowledge reports and agree on a disclosure timeline; no response deadline is promised by this initial policy.

## Supported versions

Security fixes target the latest released version. Deployments should be rebuilt from the reviewed lockfile and current source snapshot. Run dependency review and source freshness checks before each release. Ordinary merchant or alias corrections should use the public issue templates unless sensitive information is involved.

## Hosting

Apply the included CSP and security headers. Do not introduce external scripts, analytics, live FX requests or unrestricted cross-origin connections. Source downloads belong in maintainer scripts, never the visitor’s browser. Treat source document text and user input as untrusted data and render them as text.
