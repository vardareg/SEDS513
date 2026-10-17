# Interaction design and synthetic data

## Scope and conceptual model

The application is one comparison workspace: **two cities + one applied date range → two aligned temperature series**. The authoritative scope is the approved SEDS 513 project brief and implementation plan. The three tasks are selecting cities, filtering dates, and interpreting daily differences and patterns.

The target audience is undergraduate and graduate students with basic data interpretation skills and varied experience with scientific tools. No participant research has yet established the usability of this implementation.

## Design decisions

| Decision | User need / HCI rationale | Trade-off |
| --- | --- | --- |
| Start with two empty city slots | Makes the selection task explicit, as requested | Requires two selections before showing evidence |
| Two native selectors; prevent duplicates in both UI and state | Strong mapping to two series; error prevention; familiar keyboard and mobile behavior | A direct swap requires choosing the third city or clearing a slot first |
| Apply dates explicitly | Supports editing both endpoints without intermediate plot changes | Adds one action; pending feedback must remain clear |
| Show the applied range next to the chart | Visibility of state; prevents interpreting draft dates as plotted dates | Repeats dates intentionally in a different role |
| Keep pending date edits when changing cities | Preserves user work and makes the city/date mapping predictable | Students must notice the pending message |
| Reset to empty cities and full-year dates; focus City 1 | Recovery and user control; a predictable next keyboard action | Reset discards current selections immediately; all work is reversible |
| One shared axis and fixed full-data temperature domain | Preserves scale meaning while changing filters or cities | A short interval can show subtler variation than an automatically rescaled plot |
| Stable city colors, dash patterns, nearby key, and endpoint labels | Redundant encoding and recognition over recall | Endpoint labels require collision handling; leaders connect displaced labels to actual endpoints |
| Native date inputs with explicit labels, bounds, and formatted summaries | Familiar input, visible constraints, unambiguous confirmation | Native entry format and picker appearance follow the browser/OS |
| Shared tooltip plus a complete semantic table | Same-day comparison; access without color or pointer precision | Table inspection uses a disclosure to avoid overwhelming the main view |
| Compact controls followed by the main comparison | Task order and proximity between controls and evidence | On small screens the page scrolls naturally |
| Neutral chart title | Supports open exploration without asserting an invented finding | Students identify patterns themselves |

The visual foundation uses a quiet green-gray paper surface (`#fafbf9`), dark text (`#20372d`), green actions (`#225b45`), muted text (`#56645d`), and stable city colors: İzmir blue (`#246294`), Ankara brown (`#a0522d`), İstanbul olive (`#58644b`). System sans-serif type keeps form and chart labels consistent and avoids font requests. Numbered groups communicate the actual task sequence. No decorative images or motion are used.

## State and failure handling

- With zero/one city selected, show actionable guidance instead of an empty chart.
- With two distinct cities, render immediately using the applied dates.
- Date changes stay in the form until a successful submission. Validate on blur and submit; focus the first invalid field after a rejected submission.
- Do not swap, clamp, or silently correct invalid date ranges.
- A one-day interval shows two points and an explicit note that it does not establish a trend.
- Missing values remain `null`, display as “Unavailable,” and break lines (`connectNulls={false}`). They never become zero. The canonical dataset has no missing values; tests use a separate gap fixture.
- An unexpectedly empty interval or all-missing comparison shows a specific message. The complete daily table remains available when rows exist.
- Local chunk loading uses a brief status message; there is no simulated network/data loading workflow.

## Simulation contract

The bundled artifact is `src/data/temperatures-2025.json`. It contains 365 ascending daily records, each with values for all three cities, and generator metadata. The application imports this artifact; it does not generate random values during rendering.

Generator version **1.0.0**, year **2025**, seed **5132025**. A fixed Mulberry32 pseudorandom sequence produces independent daily variation bounded by ±2 °C. For zero-based day index `d`:

```text
temperature = baseline + amplitude × cos(2π × (d − 200) / 365) + daily variation
```

Values are rounded to 0.1 °C and negative zero is normalized to zero. The seasonal cycle peaks around day index 200.

| City | Baseline (°C) | Seasonal amplitude (°C) | Pattern |
| --- | ---: | ---: | --- |
| İzmir | 18 | 10 | Solid blue |
| Ankara | 11 | 13 | Dashed brown |
| İstanbul | 15 | 9 | Dotted olive |

These parameters are teaching choices, not fitted climate estimates. Simulated mean temperatures are not averages calculated from observed intraday readings. The model does not support meteorological conclusions, forecasts, climate trends, or claims about actual differences between cities.

Canonical `YYYY-MM-DD` strings make inclusive filtering independent of local timezone. Chart timestamps and English display formatting use UTC. The temperature domain is calculated once from every valid value in the full artifact, rounded outward to multiples of five, and shared by every comparison. Daily segments use linear interpolation; no smoothing, aggregation, or extrapolation is added.

Regenerate with `npm run data:generate`; verify with `npm run data:check`. A data change should update the method/version documentation and be reviewed for its impact on examples and tests.

## Boundaries

No maps, forecasting, real observations, additional datasets, aggregate KPI cards, advanced statistics, persistent selections, or URL-state framework are included. Root project instructions were absent at initialization. Existing installed skills and ZCode links were preserved, and no Git initialization, commit, or push was performed.
