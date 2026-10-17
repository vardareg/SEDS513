# Scientific Time-Series Explorer

A frontend-only SEDS 513 (Principles of Human–Computer Interaction) teaching prototype at İzmir Institute of Technology. Students choose two cities, apply a shared date range, and compare daily temperatures without programming.

**All temperatures are synthetic. They are not meteorological observations or estimates of actual climate.**

## Run locally

Use Node.js 24 or newer and npm. Node 24 also runs the TypeScript data generator directly.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite, normally `http://127.0.0.1:5173`. The application uses local bundled data and makes no external service requests. The development server is Vite; there is no application backend.

## Core interactions

1. Select two distinct cities from İzmir, Ankara, and İstanbul. Initially both fields are empty. Changing a city updates a valid comparison immediately.
2. Enter dates within **1 January–31 December 2025**, then select **Apply dates**. Both boundaries are included. Draft changes and errors leave the applied comparison intact.
3. Inspect both series on one date axis and a temperature scale fixed from the full dataset. Use the shared tooltip, keyboard arrow keys, or **View daily values**.

**Reset all** clears the cities, restores full-year dates, clears errors, and returns focus to City 1. No selections are persisted across reloads.

On narrow charts, click or tap to inspect a date. On wider charts, hover to inspect. Focus the chart and use the left/right arrow keys for keyboard inspection. Screen-reader interaction modes can affect chart navigation; the semantic daily-values table provides the same data without chart interaction.

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

- `src/components/`: controls, comparison chart, table, and locally owned shadcn components.
- `src/data/`: typed city metadata, synthetic dataset, reproducible generator, and dataset loading.
- `src/lib/`: pure date validation, formatting, filtering, and chart preparation; unit tests.
- `scripts/`: data generation and artifact verification.
- `tests/`: Playwright workflows, responsive screenshots, timezone checks, and automated accessibility scans.
- `docs/`: interaction rationale, data method, validation evidence, and participant-test materials.

The stack is React/TypeScript, Vite, Tailwind CSS v4, shadcn/ui (Base UI), and Recharts. The necessary shadcn primitives come from the official `@shadcn` registry; Label and Separator are Field dependencies. Local adaptations provide consistent 44px controls, system fonts, restrained colors, and no chart animation. The CLI, web font, and animation packages are not application dependencies.

The chart renderer loads only when two cities are selected. React state handles selections and dates; there is no router, global state library, backend, authentication, database, or external data API.

## Evaluation

Read `docs/design-and-data.md` for design rationale and simulation details, `docs/usability-study.md` for the participant protocol, and `docs/validation.md` for recorded engineering verification and limitations. Automated test results are not evidence of human usability or complete accessibility conformance.
