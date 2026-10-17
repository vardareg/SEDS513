import { useMemo, useState } from 'react'
import { CITIES, CITY_IDS } from '../../data/cities'
import { DATASET_METADATA, TEMPERATURE_DOMAIN } from '../../data/dataset'
import type { CityId, TemperatureDay } from '../../data/types'
import { formatTemperature } from '../../lib/comparison'
import { MONTH_LABELS } from '../../lib/monthly'
import { cityValues, mean } from '../../lib/stats'
import { formatDate } from '../../lib/dates'
import { temperatureColor } from '../../lib/heatmap'
import { Field, FieldLabel } from '../ui/field'
import { NativeSelect, NativeSelectOption } from '../ui/native-select'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'

// 2025-01-01 falls on a Wednesday; rows follow that weekday alignment so each
// grid column is one calendar week.
const FIRST_WEEKDAY = 3

interface HeatCell {
  date: string
  value: number | null
  week: number
  weekday: number
}

function buildCells(days: readonly TemperatureDay[], city: CityId): HeatCell[] {
  return days.map((day, index) => ({
    date: day.date,
    value: day.temperaturesC[city],
    week: Math.floor(index / 7),
    weekday: (FIRST_WEEKDAY + index) % 7,
  }))
}

/** First grid column of each month label, skipping months that share a column. */
function monthLabelColumns(): { label: string; column: number }[] {
  const labels: { label: string; column: number }[] = []
  let daysBeforeMonth = 0
  for (let month = 0; month < 12; month++) {
    const column = Math.floor(daysBeforeMonth / 7) + 1
    if (labels.every((entry) => entry.column !== column)) labels.push({ label: MONTH_LABELS[month], column })
    daysBeforeMonth += new Date(Date.UTC(2025, month + 1, 0)).getUTCDate()
  }
  return labels
}

const MONTH_LABELS_IN_GRID = monthLabelColumns()

export function CalendarHeatmap({ days }: { days: readonly TemperatureDay[] }) {
  const [city, setCity] = useState<CityId>('izmir')
  const cells = useMemo(() => buildCells(days, city), [days, city])
  const values = useMemo(() => cityValues(days, city), [days, city])
  const average = mean(values)
  const missing = cells.filter((cell) => cell.value === null).length

  return (
    <div className="heatmap-block" data-testid="calendar-heatmap">
      <div className="heatmap-controls">
        <Field>
          <FieldLabel htmlFor="heatmap-city">City</FieldLabel>
          <NativeSelect id="heatmap-city" name="heatmap-city" value={city} onChange={(event) => setCity(event.target.value as CityId)}>
            {CITY_IDS.map((option) => (
              <NativeSelectOption key={option} value={option}>{CITIES[option].name}</NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <p className="heatmap-summary">
          {CITIES[city].name}: mean {average === null ? 'unavailable' : `${average.toFixed(1)} °C`}, {missing} missing {missing === 1 ? 'day' : 'days'}.
        </p>
      </div>
      <div className="heatmap-scroll" role="region" aria-label="Calendar heatmap, scrollable" tabIndex={0}>
        <div className="heatmap-months" aria-hidden="true">
          {MONTH_LABELS_IN_GRID.map(({ label, column }) => (
            <span key={label} style={{ gridColumnStart: column }}>{label}</span>
          ))}
        </div>
        <div
          className="heatmap-grid"
          role="img"
          aria-label={`Calendar heatmap of simulated daily mean temperatures for ${CITIES[city].name} across 2025. Colder days are shown in blue and warmer days in red. Missing days are hatched.`}
          data-city={city}
        >
          {cells.map((cell) => (
            <span
              key={cell.date}
              className={cell.value === null ? 'heatmap-cell heatmap-gap' : 'heatmap-cell'}
              style={cell.value === null ? undefined : { background: temperatureColor(cell.value, TEMPERATURE_DOMAIN) }}
              title={`${formatDate(cell.date)}: ${formatTemperature(cell.value)}`}
            />
          ))}
        </div>
      </div>
      <div className="heatmap-scale" aria-hidden="true">
        <span>{TEMPERATURE_DOMAIN[0]} °C</span>
        <span className="heatmap-scale-ramp" />
        <span>{TEMPERATURE_DOMAIN[1]} °C</span>
        <span className="heatmap-scale-gap" />
        <span>missing</span>
      </div>
      <details className="daily-values">
        <summary>View daily values for {CITIES[city].name} <span className="summary-count">({cells.length} days)</span></summary>
        <div className="table-region" role="region" aria-label={`Daily temperature values for ${CITIES[city].name}`} tabIndex={0}>
          <Table>
            <TableCaption>
              Simulated daily means in °C for {CITIES[city].name}, 1 Jan to 31 Dec 2025. Missing values are marked Unavailable.
              Documented gaps: {DATASET_METADATA.knownGaps[city].length === 0 ? 'none' : DATASET_METADATA.knownGaps[city].join(', ')}.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Date</TableHead>
                <TableHead scope="col" className="text-right">{CITIES[city].name} (°C)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cells.map((cell) => (
                <TableRow key={cell.date}>
                  <TableHead scope="row"><time dateTime={cell.date}>{formatDate(cell.date)}</time></TableHead>
                  <TableCell className="text-right tabular-nums">{formatTemperature(cell.value).replace(' °C', '')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </details>
    </div>
  )
}
