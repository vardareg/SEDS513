# Repository Guidelines

## Project Structure & Module Organization

This frontend-only SEDS 513 prototype uses React, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, and Recharts.

- `src/components/`: comparison controls, chart, and table; `ui/` holds locally owned shadcn primitives.
- `src/lib/`: pure date/comparison helpers and colocated unit tests.
- `src/data/`: city metadata, types, deterministic generator, and bundled `temperatures-2025.json`.
- `src/index.css`: shared styles and design tokens.
- `scripts/`: dataset generation and verification; `tests/`: browser workflows.
- `docs/`: design rationale, validation evidence, and usability-study materials. `dist/` is generated build output.

## Build, Test, and Development Commands

Use Node.js 24+ and npm; install dependencies with `npm ci`.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite, normally at `http://127.0.0.1:5173`. |
| `npm run build` | Run TypeScript checks and build into `dist/`. |
| `npm run preview` | Serve the production build locally. |
| `npm run typecheck` | Check application, configuration, and browser-test types. |
| `npm run lint` | Run Oxlint. |
| `npm test` | Run Vitest unit tests. |
| `npm run test:e2e` | Run Playwright desktop/mobile Chromium workflows and axe scans. |
| `npm run data:check` | Verify bundled JSON matches the generator exactly. |
| `npm run data:generate` | Regenerate the bundled dataset. |

Install Chromium with `npx playwright install chromium` before browser tests; Playwright starts Vite on port 4173.

## Coding Style & Naming Conventions

Match application formatting: two-space indentation, single quotes, and omitted semicolons. Use strict TypeScript and type-only imports. Name React components/files in PascalCase, helpers in camelCase, and constants in UPPER_SNAKE_CASE. Keep transformations in `src/lib/`. Oxlint is configured; no formatter is configured.

## Testing Guidelines

Place Vitest cases in `src/**/*.test.ts` and Playwright cases in `tests/*.spec.ts`, with descriptive behavior names. Cover inclusive dates, timezone independence, missing values, pending/applied state, keyboard access, and responsive layouts. No numeric coverage threshold is configured. Run relevant checks before requesting review; include browser tests for interaction changes.

## Commit & Pull Request Guidelines

Git history is unavailable in this checkout. Use concise imperative subjects, optionally scoped, such as `fix: preserve pending date edits`. PRs should explain behavior changes, link relevant issues, list checks run, and include desktop/mobile screenshots for UI changes. Update affected documentation.

## Data Integrity

Keep temperatures explicitly labeled synthetic. Preserve UTC date handling, inclusive filtering, and null gaps. Regenerate rather than hand-edit JSON; document generator changes in `docs/design-and-data.md`.
