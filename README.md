# Scientific Time-Series Explorer

A frontend-only SEDS 513 (Principles of Human–Computer Interaction) teaching prototype at İzmir Institute of Technology. Students explore simulated 2025 daily temperatures for six Turkish cities across four pages: comparison, analytics, city profiles, and methodology.

**All temperatures are synthetic. They are not meteorological observations or estimates of actual climate.**

New to the project? Read the [beginner walkthrough](docs/beginner-walkthrough.md) for an explanation of what was built, the commands used, and how the files work together.

## Run locally

Use Node.js 24 or newer and npm. Node 24 also runs the TypeScript data generator directly.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite, normally `http://127.0.0.1:5173`. The application uses local bundled data and makes no external service requests. The development server is Vite; there is no application backend.

## Pages

| Page | What students do |
| --- | --- |
| **Compare** (`/`) | Choose two distinct cities, apply a date range, and read both series on one shared scale. |
| **Analytics** (`/analytics`) | Full-year statistics per city, monthly means, daily distributions, a calendar heatmap, and city correlations. |
| **Cities** (`/cities`) | Per-city profiles with model inputs and monthly sparklines; a quick compare hands the pair to the Compare page. |
| **About** (`/about`) | Generator methodology, parameters, documented gaps, and data-integrity rules, rendered from the dataset metadata. |

## Core interactions

1. Select two distinct cities from İzmir, Ankara, İstanbul, Antalya, Erzurum, and Van. Duplicate choices are prevented; **Swap cities** exchanges the two slots.
2. Enter dates within **1 January–31 December 2025**, then select **Apply dates**. Both boundaries are included. Draft changes and errors leave the applied comparison intact. Quick ranges (seasons, December, full year) apply immediately.
3. Inspect both series on one date axis and a temperature scale fixed from the full dataset. Use the shared tooltip, keyboard arrow keys, or **View daily values**. A rolling-average overlay (7/14/30-day), a synchronized daily-difference chart, and **Download CSV** extend the comparison; missing days break lines, pause rolling means, and export as empty fields.

**Reset all** clears the cities, restores full-year dates, clears errors, and returns focus to City 1. The chosen theme (light/dark) persists across reloads; a `?from=&to=&start=&end=` link seeds the comparison once and then cleans the URL.

On narrow charts, click or tap to inspect a date. On wider charts, hover to inspect. Focus a chart and use the left/right arrow keys for keyboard inspection. Screen-reader interaction modes can affect chart navigation; every chart has a semantic table or text alternative without chart interaction.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development server |
| `npm run build` | Type-check application, configs, and browser tests; build static files into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | TypeScript checks |
| `npm run lint` | Oxlint checks, using the current Vite scaffold's linter |
| `npm test` | Deterministic data and transformation tests |
| `npm run data:check` | Verify that the bundled JSON exactly matches its generator |
| `npm run data:generate` | Recreate the bundled dataset |
| `npx playwright install chromium` | Install the browser used by the test suite |
| `npm run test:e2e` | Desktop/mobile browser workflows and axe accessibility checks |

Browser tests start their own local Vite server on port 4173. Reports and screenshots go to the ignored `playwright-report/` and `test-results/` directories. No test depends on a live weather service.

## Structure

- `src/pages/`: the four routed pages plus the not-found page.
- `src/components/`: comparison controls, charts, and table; `analytics/` and `cities/` hold page-specific components; `ui/` holds locally owned shadcn components.
- `src/data/`: typed city metadata, synthetic dataset, reproducible generator, and dataset loading.
- `src/lib/`: pure date, comparison, statistics, rolling, monthly, correlation, difference, CSV, and heatmap helpers; colocated unit tests.
- `scripts/`: data generation and artifact verification.
- `tests/`: Playwright workflows for every page, responsive screenshots, timezone checks, and automated accessibility scans.
- `docs/`: interaction rationale, data method, validation evidence, a beginner walkthrough, and participant-test materials.

The stack is React/TypeScript, Vite, Tailwind CSS v4, shadcn/ui (Base UI), Recharts, and React Router. The necessary shadcn primitives come from the official `@shadcn` registry; Label and Separator are Field dependencies. Local adaptations provide consistent 44px controls, system fonts, restrained colors, and no chart animation.

Each page and each chart renderer loads lazily in its own chunk. Compare selections live in a small React context (and URL hand-off links); there is no global state library, backend, authentication, database, or external data API.

## Evaluation

Read `docs/design-and-data.md` for design rationale and simulation details, `docs/usability-study.md` for the participant protocol, and `docs/validation.md` for recorded engineering verification and limitations. Automated test results are not evidence of human usability or complete accessibility conformance.
