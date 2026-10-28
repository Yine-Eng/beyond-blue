# 0004. Launch File PDF: client-side @react-pdf/renderer

- **Status:** Proposed
- **Date:** 2026-10-27
- **Deciders:** Sampson (`Yine-Eng`)

## Context
Students export their Launch File as a PDF from their phones. It should be branded, readable, accessible and free to run.

## Decision
Use **`@react-pdf/renderer`** in the browser, dynamically imported only when the student taps "Download PDF". The Launch File page passes already-authorized, serializable data to the renderer. Brand fonts are registered from self-hosted font files. On mobile the PDF is offered through `navigator.share` when available, otherwise as a download.

## Consequences
- No serverless CPU cost and no function-timeout risk on Vercel Hobby.
- Works the same in demo mode.
- Adds a large (~500 KB) chunk that loads only on demand.
- Uploaded files are listed as titled links rather than embedded in the PDF.

## Alternatives considered
- **Server-side react-pdf in a route handler:** works, but costs function time and needs fonts bundled server-side.
- **Headless Chrome (Puppeteer) on Vercel:** heavy, slow cold starts, bundle size limits.
- **`window.print()` with print CSS:** unreliable on iOS and inconsistent output.
