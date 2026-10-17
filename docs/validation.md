# Engineering validation

This record describes engineering verification, not participant usability or a WCAG conformance certification. Human usability sessions and manual assistive-technology checks are separate activities.

## Automated coverage

- Pure-function tests cover artifact reproducibility, seeded variation, full-year date coverage, documented temperature bounds and gap days, invalid dates, inclusive filtering, city pairs, missing values, zero temperatures, numeric domains, endpoint label placement, summary statistics (mean/median/standard deviation/extremes/histogram bins), trailing rolling means with the null-window policy, UTC monthly aggregation, Pearson correlation, daily differences and their domain, CSV escaping and null fields, and the heatmap color ramp.
- Browser workflows cover initial/partial selections, all fifteen city pairs including the added cities, pending dates, rejected dates, focus recovery, reset, quick-range presets, city swap, rolling overlay, difference-chart toggle, CSV download contents, exact table values, shared chart inspection, single-day ranges, timezone independence, layout reflow, runtime errors/external requests, page routing and titles, analytics values against the bundled JSON, heatmap gap marking, and the Cities-to-Compare hand-off.
- Axe scans run in the initial, valid comparison, validation-error, expanded-table, and rolling-overlay states on the Compare page; on every page in light mode; and on Compare and Analytics in dark mode. The suite checks WCAG A/AA tags, including 2.1/2.2 AA where supported by the scanner.
- Browser screenshots cover 320px, 768px, and 1440px layouts in both themes. Chart animations and transitions are disabled/reduced during capture.

## Results

Initial implementation recorded on **17 October 2026**; the multi-page upgrade was re-verified the same day. Node.js 24.15.0, Chromium 156 through Playwright 1.64.1, Europe/Istanbul test timezone plus dedicated America/Los_Angeles checks.

| Check | Result |
| --- | --- |
| `npm run build` | Passed, including TypeScript checks for app/config/browser tests; every page and chart renderer loads in its own lazy chunk (largest: app shell ≈ 298 kB, shared chart module ≈ 338 kB before gzip) |
| `npm test` | 49 passed across 8 files |
| `npm run lint` | Passed, 0 warnings |
| `npm run data:check` | Passed: exact artifact reproduction, 365 dates / 2,190 values / 8 documented gaps, seed 5132025; the original three cities' values are unchanged from generator 1.x |
| `npm run test:e2e` | 81 passed, 1 intentionally skipped; desktop and Pixel 7 mobile emulation |
| Axe checks | No detected violations across the covered states, pages, and both themes |
| Runtime checks | No page errors or console errors in the tested flows, including two-day/single-day ranges; no external service requests |
| Responsive screenshots | Reviewed at 320px, 768px, and 1440px in light and dark themes; no page overflow, clipped controls, or overlapping endpoint labels in the reviewed states |
| CSV export | Playwright download event verified: RFC 4180 escaping, CRLF line endings, UTF-8 BOM for Excel, documented gap days as empty fields |

The skipped case remains the mobile duplicate of the full desktop keyboard route through native selectors and the disclosure. The mobile project separately passes explicit chart keyboard inspection and touch inspection. Both profiles use Chromium; this is not a cross-engine certification.

Calculated WCAG relative-luminance contrast against the light `#fafbf9` and dark `#0f1713` surfaces:

| Element | Light ratio | Dark ratio |
| --- | ---: | ---: |
| Main text | 12.29:1 | 15.14:1 |
| Secondary text | 5.99:1 | 8.05:1 |
| Action color as text | 7.63:1 | 8.09:1 |
| İzmir series | 6.23:1 | 7.90:1 |
| Ankara series | 5.41:1 | 7.62:1 |
| İstanbul series | 6.06:1 | 8.53:1 |
| Antalya series | 5.00:1 | 8.69:1 |
| Erzurum series | 6.10:1 | 7.69:1 |
| Van series | 5.94:1 | 7.33:1 |
| Button label on primary | 7.92:1 | 7.28:1 |

These palette calculations supplement the scanner; they do not evaluate every possible rendered state or establish complete conformance. Color is supplemented with line patterns and names.

## Engineering findings resolved

These were found by automated checks and code inspection, not participant observations:

1. The generator could produce JavaScript negative zero while JSON serialized it as zero. Normalize zero before emitting values so the in-memory generator and bundled artifact match exactly.
2. Showing a validation message on blur could move the submit button between pointer-down and pointer-up, preventing the click. When focus moves to a form action, defer revealing new blur errors to submission; rejected submission then shows the message and focuses the invalid field. Browser tests verify the correction on both profiles.
3. Two-day ranges could request duplicate date ticks. Deduplicate requested tick positions; the console-error check covers the short-range regression.
4. The initial single JavaScript chunk exceeded Vite's size warning threshold. Load the chart renderer only after city selection; pages are now separate lazy chunks as well.
5. The rolling-average segmented control first hid its radio inputs with `pointer-events: none`, so pointer clicks and automation could not reach them. The invisible input now covers the whole chip, keeping the segmented look with full hit areas.
6. The difference chart on a single-day range emitted duplicate React keys because both requested ticks shared one timestamp. Deduplicate ticks and pad a single-day domain by half a day, mirroring the main chart.
7. Recharts 3 names axis ticks `recharts-cartesian-axis-tick` (not the v2 `recharts-cartesian-tick`); browser assertions were updated to the rendered classes.
8. Excel opened the exported CSV with mojibake Turkish characters until a UTF-8 BOM was prepended to the download blob; the test strips the BOM before comparing content.

The test harness also needed to scroll the chart into the viewport before a mobile coordinate tap. That correction is a test setup finding, not a participant or product finding.

## Manual follow-up for course evaluation

- Test a screen reader with the user's actual interaction mode, including chart arrows, validation feedback, and the semantic table.
- Check browser zoom at 200% and reflow at 400%, native date entry on the target OS, and focus visibility with the participant's input method.
- Test touch on physical devices; browser mobile emulation does not reproduce every mobile picker or assistive technology.
- Check Firefox and Safari before making browser-compatibility claims beyond the tested Chromium profiles.
- Run the participant protocol in `usability-study.md`; no participant evidence exists yet.
