# Interaction design and synthetic data

## Scope and conceptual model

The application is a small multi-page explorer built around one comparison workspace: **two cities + one applied date range → two aligned temperature series**, plus three supporting pages (Analytics, Cities, About) that analyze the same synthetic dataset. The authoritative scope is the approved SEDS 513 project brief and implementation plan, extended in the 2.x upgrade. The core tasks remain selecting cities, filtering dates, and interpreting daily differences and patterns.

The target audience is undergraduate and graduate students with basic data interpretation skills and varied experience with scientific tools. No participant research has yet established the usability of this implementation.

## Design decisions

| Decision | User need / HCI rationale | Trade-off |
| --- | --- | --- |
| Start with two empty city slots | Makes the selection task explicit, as requested | Requires two selections before showing evidence |
| Two native selectors; prevent duplicates in both UI and state | Strong mapping to two series; error prevention; familiar keyboard and mobile behavior | A direct swap requires choosing the third city or clearing a slot first |
| Swap-cities button beside the selectors | Direct recovery from an inverted pair without clearing either slot | One more control near the primary task |
| Apply dates explicitly | Supports editing both endpoints without intermediate plot changes | Adds one action; pending feedback must remain clear |
| Quick ranges apply immediately | A preset is a complete, valid range; one action instead of three | Preset clicks bypass the draft state; the pending pattern still governs manual edits |
| Show the applied range next to the chart | Visibility of state; prevents interpreting draft dates as plotted dates | Repeats dates intentionally in a different role |
| Keep pending date edits when changing cities | Preserves user work and makes the city/date mapping predictable | Students must notice the pending message |
| Reset to empty cities and full-year dates; focus City 1 | Recovery and user control; a predictable next keyboard action | Reset discards current selections immediately; all work is reversible |
| One shared axis and fixed full-data temperature domain | Preserves scale meaning while changing filters or cities | A short interval can show subtler variation than an automatically rescaled plot |
| Stable city colors, dash patterns, nearby key, and endpoint labels | Redundant encoding and recognition over recall | Endpoint labels require collision handling; leaders connect displaced labels to actual endpoints |
| Rolling means as thinner overlay lines, paused at gaps | Shows the seasonal shape without hiding daily variation or missing data | Overlay adds four possible lines to the chart; off by default |
| Synchronized daily-difference chart under the comparison | Makes “which city is warmer, by how much” directly readable | A second chart to dismiss or ignore; toggle provided |
| CSV export of the filtered range | Takes evidence out of the prototype for coursework | Client-side only; the export reflects synthetic data |
| Multi-page structure with four nav links and per-page titles | Separates comparison from dataset-level analysis without menu nesting | Nav wraps on narrow screens instead of collapsing |
| Cities page quick-compare hands off via URL parameters | One action from a profile to a live comparison; shareable links | Parameters are consumed once, then the URL is cleaned |
| Light/dark theme toggle honoring the system preference | Reader comfort; charts re-theme through CSS variables | A second palette to keep contrast-checked |
| Native date inputs with explicit labels, bounds, and formatted summaries | Familiar input, visible constraints, unambiguous confirmation | Native entry format and picker appearance follow the browser/OS |
| Shared tooltip plus a complete semantic table | Same-day comparison; access without color or pointer precision | Table inspection uses a disclosure to avoid overwhelming the main view |
| Compact controls followed by the main comparison | Task order and proximity between controls and evidence | On small screens the page scrolls naturally |
| Neutral chart title | Supports open exploration without asserting an invented finding | Students identify patterns themselves |

The visual foundation uses a quiet green-gray paper surface (`#fafbf9`, dark `#0f1713`), dark text (`#20372d`, dark `#e4ece7`), green actions (`#225b45`, dark `#6fbc98`), muted text (`#56645d`, dark `#9db1a6`), and six stable city colors with distinct dash patterns: İzmir blue (`#246294`), Ankara brown (`#a0522d`), İstanbul olive (`#58644b`), Antalya teal (`#0e7a72`), Erzurum violet (`#5b54ad`), Van rose (`#a23d68`); the dark theme lifts and slightly desaturates each rather than inverting. Every city color keeps at least 4.5:1 contrast against its background in both themes; dash patterns (solid, dashed, dotted, dash-dot, long-dash, short-dash) remain the non-color encoding. The analytics heatmap uses a cool-to-warm sequential ramp between `--heat-cold` and `--heat-warm` tokens, with a hatched pattern for missing days. System sans-serif type keeps form and chart labels consistent and avoids font requests. Numbered groups communicate the actual task sequence; the Analytics, Cities, and About pages use unnumbered sections because they are not sequences. No decorative images or motion are used.

## State and failure handling

- With zero/one city selected, show actionable guidance instead of an empty chart.
- With two distinct cities, render immediately using the applied dates.
- Date changes stay in the form until a successful submission. Validate on blur and submit; focus the first invalid field after a rejected submission. Quick-range presets are complete valid ranges and apply immediately; an external apply (preset, hand-off link, reset) resynchronizes the form draft by remounting it.
- Do not swap, clamp, or silently correct invalid date ranges. Invalid hand-off URL parameters are ignored entirely.
- A one-day interval shows two points and an explicit note that it does not establish a trend.
- Missing values remain `null`, display as “Unavailable,” and break lines (`connectNulls={false}`). They never become zero. Rolling means yield `null` while any day in their window is missing; statistics exclude missing days and count them separately; CSV writes empty fields; heatmap cells show a hatched pattern.
- An unexpectedly empty interval or all-missing comparison shows a specific message. The complete daily table remains available when rows exist.
- Local chunk loading uses a brief status message; there is no simulated network/data loading workflow.
- The theme choice is stored in `localStorage` and applied by an inline pre-paint script so a dark-preferred reader never sees a light flash.

## Simulation contract

The bundled artifact is `src/data/temperatures-2025.json`. It contains 365 ascending daily records, each with values for all six cities (2,190 values), and generator metadata. The application imports this artifact; it does not generate random values during rendering.

Generator version **2.0.0**, year **2025**, seed **5132025**. A fixed Mulberry32 pseudorandom sequence produces independent daily variation bounded by ±2 °C. Generator 2.x draws the original three cities exactly as 1.x did — their values are unchanged — then continues the same seeded stream for the added cities. For zero-based day index `d`:

```text
temperature = baseline + amplitude × cos(2π × (d − 200) / 365) + daily variation
```

Values are rounded to 0.1 °C and negative zero is normalized to zero. The seasonal cycle peaks around day index 200. Eight documented gap days are set to `null` after generation and listed in the metadata as `knownGaps`: Erzurum 10–12 January, Van 20–22 July, İstanbul 3–4 November 2025.

| City | Region | Baseline (°C) | Seasonal amplitude (°C) | Pattern |
| --- | --- | ---: | ---: | --- |
| İzmir | Aegean | 18 | 10 | Solid blue |
| Ankara | Central Anatolia | 11 | 13 | Dashed brown |
| İstanbul | Marmara | 15 | 9 | Dotted olive |
| Antalya | Mediterranean | 19 | 10 | Dash-dot teal |
| Erzurum | Eastern Anatolia | 6 | 14 | Long-dash violet |
| Van | Eastern Anatolia | 9 | 13 | Short-dash rose |

These parameters are teaching choices, not fitted climate estimates. Simulated mean temperatures are not averages calculated from observed intraday readings. The model does not support meteorological conclusions, forecasts, climate trends, or claims about actual differences between cities.

Canonical `YYYY-MM-DD` strings make inclusive filtering independent of local timezone. Chart timestamps, monthly grouping, and English display formatting use UTC; months are read from the date string itself. The temperature domain is calculated once from every valid value in the full artifact (−10 to 35 °C), rounded outward to multiples of five, and shared by every comparison and the monthly chart. Daily segments use linear interpolation; no smoothing, aggregation, or extrapolation is added to the plotted daily values. The analytics page adds derived aggregates (monthly means, rolling means, histograms, Pearson correlations) that are labeled as such and never replace the daily values.

Regenerate with `npm run data:generate`; verify with `npm run data:check`. A data change should update the method/version documentation and be reviewed for its impact on examples and tests.

## Boundaries

No maps, forecasting, real observations, or additional datasets are included. The 2.x upgrade moved several earlier exclusions into scope: aggregate statistics and charts (Analytics page), URL hand-off parameters, a persisted light/dark theme, CSV export, and React Router for the four pages. There is still no global state library (compare state lives in one small React context), no persistence beyond the theme choice, no backend, authentication, database, or external data API.
