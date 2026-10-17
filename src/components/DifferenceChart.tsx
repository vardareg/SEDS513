import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CITIES } from '../data/cities'
import type { CityPair, TemperatureDay } from '../data/types'
import { chartDays } from '../lib/comparison'
import { dailyDifference, differenceDomain } from '../lib/difference'
import { DAY_MS, formatDate, formatTick } from '../lib/dates'

const CHART_HEIGHT = 190
const MARGIN = { top: 12, right: 16, bottom: 12, left: 0 }

interface DifferenceRow {
  date: string
  timestamp: number
  difference: number | null
}

function DifferenceTooltip({ active, row }: { active?: boolean; row?: DifferenceRow }) {
  if (!active || !row) return null
  return (
    <div className="chart-tooltip" data-testid="difference-tooltip">
      <p className="tooltip-date">{formatDate(row.date)}</p>
      <p className="tooltip-value">
        <span>Difference</span>
        <span>{row.difference === null ? 'Unavailable' : `${row.difference.toFixed(1)} °C`}</span>
      </p>
    </div>
  )
}

export default function DifferenceChart({ days, pair }: { days: readonly TemperatureDay[]; pair: CityPair }) {
  const rows = useMemo<DifferenceRow[]>(() => {
    const differences = dailyDifference(days, pair)
    return chartDays(days).map((row, index) => ({ date: row.date, timestamp: row.timestamp, difference: differences[index].difference }))
  }, [days, pair])
  const domain = useMemo(() => differenceDomain(dailyDifference(days, pair)), [days, pair])
  const first = rows[0]
  const last = rows.at(-1)
  if (!first || !last) return null
  const singleDay = first.timestamp === last.timestamp
  // A single day needs a padded domain, and deduped ticks avoid duplicate React keys.
  const xDomain: [number, number] = singleDay
    ? [first.timestamp - DAY_MS / 2, first.timestamp + DAY_MS / 2]
    : [first.timestamp, last.timestamp]
  const ticks = [...new Set([first.timestamp, last.timestamp])]

  return (
    <figure aria-labelledby="difference-title" aria-describedby="difference-description" className="difference-figure">
      <div className="chart-heading">
        <h3 id="difference-title">Daily difference <span>{CITIES[pair[0]].name} − {CITIES[pair[1]].name} (°C)</span></h3>
      </div>
      <div className="chart-container" data-testid="difference-chart">
        <ResponsiveContainer width="100%" height={CHART_HEIGHT} initialDimension={{ width: 300, height: CHART_HEIGHT }}>
          <BarChart
            data={rows}
            margin={MARGIN}
            syncId="comparison"
            accessibilityLayer
            aria-label={`Daily temperature difference between ${CITIES[pair[0]].name} and ${CITIES[pair[1]].name}. Use left and right arrow keys to inspect dates.`}
          >
            <CartesianGrid vertical={false} stroke="var(--chart-rule)" strokeOpacity={0.1} />
            <XAxis dataKey="timestamp" type="number" scale="time" domain={xDomain} ticks={ticks} tickFormatter={formatTick} tickLine={false} axisLine={false} height={30} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} minTickGap={16} />
            <YAxis domain={domain} ticks={[domain[0], 0, domain[1]]} width={36} tickLine={false} axisLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} allowDataOverflow />
            <Tooltip
              isAnimationActive={false}
              cursor={{ fill: 'var(--muted-foreground)', opacity: 0.08 }}
              content={(props) => <DifferenceTooltip active={props.active} row={props.payload[0]?.payload as DifferenceRow | undefined} />}
            />
            <ReferenceLine y={0} stroke="var(--chart-rule)" strokeOpacity={0.6} />
            <Bar dataKey="difference" name="Difference" fill="var(--primary)" fillOpacity={0.55} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <figcaption id="difference-description" className="chart-caption">
        <p>Bars rise above zero when {CITIES[pair[0]].name} is warmer than {CITIES[pair[1]].name}. Missing days leave no bar. Move across either chart and both readouts follow the same date.</p>
      </figcaption>
    </figure>
  )
}
