# ADR 001: Static export and local calculations

Status: accepted, 23 October 2026.

## Context

The target visitor often uses mobile data and a mid-range phone. The product needs to explain a dated public list and calculate estimates without accessing private bank or MoMo information. A backend would add operational and privacy costs without helping the version 1 task.

## Decision

Use the Next.js App Router with `output: 'export'`. Generate every merchant route from validated, committed source data. Download and extract the official PDF in a separate maintainer script. Bundle all runtime assets locally. Form amounts stay in browser memory and language preference is stored locally. No analytics, remote fonts, bank integration, database or server-side form submission is permitted in version 1.

Use branded integer pesewas and exact rational intermediate arithmetic. Keep rates and their effective date in a versioned JSON config. Validate source files with Zod before producing the export. Cite the GRA source next to decisions and expose the data date on every page.

## Consequences

The site can be hosted as files and static merchant guidance remains readable with JavaScript disabled. Interactive search and calculations require JavaScript. Data changes require a reviewed refresh and rebuild. The published list is a snapshot, so freshness checks and a visible date are essential. Offline caching must serve a dated snapshot and must not imply that the data is live. Security headers must be supplied by the static hosting platform. A downloaded share image is generated locally and does not verify a particular transaction.
