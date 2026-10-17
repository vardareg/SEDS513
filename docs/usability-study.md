# Formative usability study materials

**Status: prepared protocol; no participants tested and no usability findings recorded.**

## Research questions

- Can students select two distinct cities without assistance?
- Do students distinguish draft date edits from the dates currently plotted?
- Can they compare a daily value and describe a visible pattern using the shared axes?
- Can they recover from invalid dates and reset the workspace?
- Do they understand that the temperatures are simulated?

## Participants and session

Recruit five undergraduate/graduate students with varied scientific-tool experience. Record relevant experience without collecting unnecessary identifying information. Explain that the interface is being evaluated and that participants may stop. Request agreement before recording a session or quoting a participant.

Allow approximately 15–20 minutes per participant. Start each session from a fresh page with empty city selections. Use a laptop initially; include touch/keyboard-only sessions where participants normally use those methods. Record the actual device/browser and input method. A small formative sample supports discovering issues, not population-level claims.

## Moderator introduction

“This tool lets you explore temperature data. We are testing the interface, not your abilities. Please say what you are looking for and what you expect to happen. Try each task as you normally would. I will avoid helping immediately so we can see where the interface needs improvement.”

Do not reveal the location of controls or explain the synthetic-data notice before the relevant observations. Intervene when a participant is stuck or requests help, and record exactly what assistance was given.

## Tasks and observations

| Task prompt | Observe |
| --- | --- |
| Compare İzmir and Ankara for the available year. | Discovery of the two controls, duplicate-selection understanding, recognition of when the chart appears |
| Show only 1–30 June 2025 for both cities. | Date entry, use of Apply dates, recognition of pending versus applied state, understanding of inclusive dates |
| For 15 June, identify each city's temperature. Then describe one pattern or difference across June. | Series identification, shared date inspection, units, exact-value accuracy, table discovery if needed, unsupported inference |
| Change the comparison to İzmir and İstanbul while keeping June. | Whether students understand which controls update immediately and which range remains applied |
| Try a start date of 1 August and an end date of 1 July. Then show the full year again. | Error discovery, interpretation, recovery, whether students recognize that the previous chart remains applied |
| Return the tool to its initial state. | Reset discovery, expected outcome, focus behavior for keyboard users |
| Explain what these temperatures represent and whether they are actual measurements. | Synthetic provenance awareness and any inappropriate confidence in real-world conclusions |

Before sessions, the moderator should use the bundled table to prepare an answer key for exact-value questions. Do not invent expected participant interpretations or assume one specific observation is the only valid pattern description.

## Observation sheet

```text
Participant code:
Date / device / browser / input method:
Prior chart and scientific-tool experience:

Task:
Outcome: completed independently / completed with assistance / not completed
Assistance given:
Observed actions, hesitation, and errors:
Interpretation accuracy:
Participant's words (verbatim only when actually recorded):
Approximate time (diagnostic only):
Moderator interpretation (separate from observed facts):
```

After the tasks, ask: “What was hardest to understand?”, “How could you tell which dates the chart was using?”, and “What would you change first?”

## Issue and iteration record

| ID | Observed evidence | User impact | Severity | Proposed change | Retest result |
| --- | --- | --- | --- | --- | --- |
| — | No participant observations yet | — | — | — | — |

Use blocker/major/minor severity based on task impact, recurrence within this sample, and recoverability. Keep observations separate from design hypotheses. After a change, repeat the affected task with fresh participants where feasible. Report individual observations and actual counts; do not turn automated functional passes into human-usability outcomes.
