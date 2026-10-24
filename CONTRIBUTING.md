# Contributing to VAT Check GH

Choose a [good first issue](https://github.com/KingEmma7/vat-check-gh/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) or open an issue describing a reproducible problem. Comment before starting a larger change so others can coordinate. Please follow the [code of conduct](CODE_OF_CONDUCT.md).

## Make a change

1. Fork the repository, clone your fork, and create a branch for one focused change.
2. Use Node 22.19+ and pnpm 9.15.9. Run `pnpm install --frozen-lockfile` and `pnpm dev`.
3. Add a meaningful regression test for changed behavior. Keep existing tests and avoid unrelated formatting.
4. Run the relevant checks below and open a pull request using the template. Explain the problem, resulting behavior and checks actually run.

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:worker
pnpm exec playwright install chromium
pnpm test:e2e
```

For loading or page-structure changes, also run `pnpm lighthouse`. For UI changes, attach a 360px screenshot and check keyboard focus, labels and 44px effective touch targets. The browser suite uses port 4173; `PLAYWRIGHT_PORT` selects another port and `QA_OUTPUT_DIR` selects the screenshot folder. Explain any checks you could not run.

## Evidence for data and tax changes

- Use official GRA sources. Cite the exact date, PDF page or FAQ question and record uncertainty in [ASSUMPTIONS.md](docs/ASSUMPTIONS.md).
- Follow [DATA.md](docs/DATA.md) to regenerate extracted records. Review the checksum, row count and diff. Do not manually rename legal entities to match brands.
- Follow [ALIASES.md](docs/ALIASES.md) for primary evidence connecting an alias to an exact listed entity. Preserve supported multiple-entity choices. Absence from a list does not establish an exemption.
- Keep money arithmetic in integer pesewas. Add an edge-case or property test when financial logic changes.

Twi changes need native-speaker review, especially tax and uncertainty wording. Preserve the draft warning until that review is documented.

## Privacy and security

Use synthetic examples. Never post statements, credentials, account numbers or identity information. Do not add trackers, remote fonts or visitor-data collection. Report vulnerabilities through [SECURITY.md](SECURITY.md), rather than a public issue.
