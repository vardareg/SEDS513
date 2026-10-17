import { useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CITIES } from '../data/cities'
import { TEMPERATURE_DOMAIN } from '../data/dataset'
import type { ChartDay, CityPair, TemperatureDay } from '../data/types'
import { chartDays, endpointLabelValues, formatTemperature } from '../lib/comparison'
import { DAY_MS, formatDate, formatTick } from '../lib/dates'

const CHART_HEIGHT = 340
const MARGIN = { top: 20, right: 76, bottom: 12, left: 0 }
const PLOT_HEIGHT = CHART_HEIGHT - MARGIN.top - MARGIN.bottom - 36

function EndpointLabel({ viewBox, offsetY, name, color }: { viewBox?: unknown; offsetY: number; name: string; color: string }) {
  if (!viewBox || typeof viewBox !== 'object') return null
  const box = viewBox as { x?: number; y?: number }
  if (typeof box.x !== 'number' || typeof box.y !== 'number') return null
  return (
    <g aria-hidden="true">
      <path d={`M${box.x + 2},${box.y} L${box.x + 9},${box.y + offsetY} L${box.x + 13},${box.y + offsetY}`} fill="none" stroke={color} strokeWidth={1} />
      <text x={box.x + 16} y={box.y + offsetY} dy="0.32em" fill={color} fontSize={13} fontWeight={600}>{name}</text>
    </g>
  )
}

export function SharedComparisonTooltip({ active, row, pair }: { active?: boolean; row?: ChartDay; pair: CityPair }) {
  if (!active || !row) return null
  return (
    <div className="chart-tooltip" data-testid="comparison-tooltip">
      <p className="tooltip-date">{formatDate(row.date)}</p>
      <dl>
        {pair.map((city) => (
          <div key={city} className="tooltip-value">
            <dt>{CITIES[city].name}</dt>
            <dd>{formatTemperature(row.temperaturesC[city])}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export function TemperatureChart({ days, pair }: { days: readonly TemperatureDay[]; pair: CityPair }) {
  const rows = useMemo(() => chartDays(days), [days])
  const [narrow, setNarrow] = useState(true)
  const first = rows[0]
  const last = rows.at(-1)
  const hasValues = rows.some((row) => pair.some((city) => row.temperaturesC[city] !== null))
  if (!first || !last || !hasValues) return <p className="empty-guidance">No temperature values are available for this period.</p>

  const singleDay = rows.length === 1
  const tickIndexes = singleDay ? [0] : narrow ? [0, rows.length - 1] : [0, Math.floor((rows.length - 1) / 2), rows.length - 1]
  const ticks = [...new Set(tickIndexes)].map((index) => rows[index].timestamp)
  const xDomain: [number, number] = singleDay
    ? [first.timestamp - DAY_MS / 2, first.timestamp + DAY_MS / 2]
    : [first.timestamp, last.timestamp]
  const endpoints = pair.map((city) => rows.findLast((row) => row.temperaturesC[city] !== null))
  const values = endpoints.map((row, index) => row?.temperaturesC[pair[index]] ?? null)
  const labelValues = values[0] !== null && values[1] !== null
    ? endpointLabelValues([values[0], values[1]], TEMPERATURE_DOMAIN)
    : values
  const scale = PLOT_HEIGHT / (TEMPERATURE_DOMAIN[1] - TEMPERATURE_DOMAIN[0])

  return (
    <figure aria-labelledby="chart-title" aria-describedby="chart-description">
      <div className="chart-heading">
        <h3 id="chart-title">Simulated daily mean temperature <span>(°C)</span></h3>
        <div className="series-key" aria-label="City line styles">
          {pair.map((city) => (
            <span key={city} className="series-item" style={{ color: CITIES[city].color }}>
              <svg width="26" height="10" aria-hidden="true"><line x1="0" y1="5" x2="26" y2="5" stroke="currentColor" strokeWidth="2.5" strokeDasharray={CITIES[city].dash} /></svg>
              {CITIES[city].name}<span className="sr-only">, {CITIES[city].pattern} line</span>
            </span>
          ))}
        </div>
      </div>
      <div className="chart-container" data-testid="temperature-chart" data-temperature-domain={TEMPERATURE_DOMAIN.join(',')}>
        <ResponsiveContainer width="100%" height={CHART_HEIGHT} initialDimension={{ width: 300, height: CHART_HEIGHT }} onResize={(width) => setNarrow(width < 520)}>
          <LineChart
            data={rows}
            margin={MARGIN}
            accessibilityLayer
            aria-label={`Daily simulated temperatures for ${CITIES[pair[0]].name} and ${CITIES[pair[1]].name}. Use left and right arrow keys to inspect dates.`}
          >
            <CartesianGrid vertical={false} stroke="var(--chart-rule)" strokeOpacity={0.1} />
            <XAxis dataKey="timestamp" type="number" scale="time" domain={xDomain} ticks={ticks} tickFormatter={formatTick} tickLine={false} axisLine={false} height={36} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} minTickGap={16} />
            <YAxis domain={TEMPERATURE_DOMAIN} ticks={Array.from({ length: (TEMPERATURE_DOMAIN[1] - TEMPERATURE_DOMAIN[0]) / 5 + 1 }, (_, index) => TEMPERATURE_DOMAIN[0] + index * 5)} width={36} tickLine={false} axisLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} allowDataOverflow />
            <Tooltip
              trigger={narrow ? 'click' : 'hover'}
              filterNull={false}
              isAnimationActive={false}
              cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1, strokeDasharray: '3 3' }}
              content={(props) => <SharedComparisonTooltip active={props.active} row={props.payload[0]?.payload as ChartDay | undefined} pair={pair} />}
            />
            {pair.map((city) => (
              <Line key={city} name={CITIES[city].name} type="linear" dataKey={`temperaturesC.${city}`} stroke={CITIES[city].color} strokeDasharray={CITIES[city].dash} strokeWidth={2} dot={singleDay ? { r: 4, strokeWidth: 2, fill: 'var(--background)' } : false} activeDot={{ r: 4, strokeWidth: 2 }} connectNulls={false} isAnimationActive={false} />
            ))}
            {pair.map((city, index) => {
              const endpoint = endpoints[index]
              const value = values[index]
              const labelValue = labelValues[index]
              if (!endpoint || value === null || labelValue === null) return null
              return <ReferenceDot key={city} x={endpoint.timestamp} y={value} r={0} label={<EndpointLabel offsetY={(value - labelValue) * scale} name={CITIES[city].name} color={CITIES[city].color} />} />
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <figcaption id="chart-description" className="chart-caption">
        <p>{narrow ? 'Tap or click a date' : 'Hover over a date'}, or focus the chart and use ← / → to compare daily values. You can also view every value in the table below.</p>
        <p>The temperature scale stays fixed at {TEMPERATURE_DOMAIN[0]} to {TEMPERATURE_DOMAIN[1]} °C across selections.{singleDay ? ' One day is shown; two points do not describe a trend.' : ' Each line joins daily samples without smoothing.'}</p>
      </figcaption>
    </figure>
  )
}
