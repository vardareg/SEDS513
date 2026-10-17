# Engineering validation

This record describes engineering verification, not participant usability or a WCAG conformance certification. Human usability sessions and manual assistive-technology checks are separate activities.

## Automated coverage

- Pure-function tests cover artifact reproducibility, seeded variation, full-year date coverage, documented temperature bounds, invalid dates, inclusive filtering, city pairs, missing values, zero temperatures, numeric domains, and endpoint label placement.
- Browser workflows cover initial/partial selections, all city pairs, pending dates, rejected dates, focus recovery, reset, exact table values, shared chart inspection, single-day ranges, timezone independence, layout reflow, and runtime errors/external requests.
- Axe scans run in the initial, valid comparison, validation-error, and expanded-table states. The suite checks WCAG A/AA tags, including 2.1/2.2 AA where supported by the scanner.
- Browser screenshots cover 320px, 768px, and 1440px layouts. Chart animations and transitions are disabled/reduced during capture.

## Results

Recorded on **17 October 2026**. Node.js 24.15.0, Chromium 156 through Playwright 1.64.1, Europe/Istanbul test timezone plus dedicated America/Los_Angeles checks.

| Check | Result |
| --- | --- |
| `npm run build` | Passed, including TypeScript checks for app/config/browser tests; no oversized-chunk warning after deferring the chart renderer |
| `npm test` | 19 passed |
| `npm run lint` | Passed |
| `npm run data:check` | Passed: exact artifact reproduction, 365 dates / 1,095 values |
| `npm run test:e2e` | 23 passed, 1 intentionally skipped; desktop and Pixel 7 mobile emulation |
| Axe checks | Eight scans across four states and two browser profiles; no detected violations |
| Runtime checks | No page errors or console errors in the tested flows, including two-day/single-day ranges; no external service requests |
| Responsive screenshots | Reviewed at 320px, 768px, and 1440px; no page overflow, clipped controls, or overlapping endpoint labels in the reviewed comparison |

The skipped case is the mobile duplicate of the full desktop keyboard route through native selectors and the disclosure. The mobile project separately passes explicit chart keyboard inspection and touch inspection. Both profiles use Chromium; this is not a cross-engine certification.

Calculated WCAG relative-luminance contrast against the `#fafbf9` surface:

| Element | Ratio |
| --- | ---: |
| Main text | 12.29:1 |
| Secondary text | 5.99:1 |
| İzmir series | 6.23:1 |
| Ankara series | 5.41:1 |
| İstanbul series | 6.06:1 |
| Input boundaries | 3.51:1 |
| White text on primary button | 7.92:1 |

These palette calculations supplement the scanner; they do not evaluate every possible rendered state or establish complete conformance. Color is supplemented with line patterns and names.

## Engineering findings resolved

These were found by automated checks and code inspection, not participant observations:

1. The generator could produce JavaScript negative zero while JSON serialized it as zero. Normalize zero before emitting values so the in-memory generator and bundled artifact match exactly.
2. Showing a validation message on blur could move the submit button between pointer-down and pointer-up, preventing the click. When focus moves to a form action, defer revealing new blur errors to submission; rejected submission then shows the message and focuses the invalid field. Browser tests verify the correction on both profiles.
3. Two-day ranges could request duplicate date ticks. Deduplicate requested tick positions; the console-error check covers the short-range regression.
4. The initial single JavaScript chunk exceeded Vite's size warning threshold. Load the chart renderer only after city selection; the final app and chart chunks are approximately 310 kB and 359 kB before gzip.

The test harness also needed to scroll the chart into the viewport before a mobile coordinate tap. That correction is a test setup finding, not a participant or product finding.

## Manual follow-up for course evaluation

- Test a screen reader with the user's actual interaction mode, including chart arrows, validation feedback, and the semantic table.
- Check browser zoom at 200% and reflow at 400%, native date entry on the target OS, and focus visibility with the participant's input method.
- Test touch on physical devices; browser mobile emulation does not reproduce every mobile picker or assistive technology.
- Check Firefox and Safari before making browser-compatibility claims beyond the tested Chromium profiles.
- Run the participant protocol in `usability-study.md`; no participant evidence exists yet.
