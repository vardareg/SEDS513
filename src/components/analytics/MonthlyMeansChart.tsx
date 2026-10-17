import { useMemo } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CITIES, CITY_IDS } from '../../data/cities'
import { TEMPERATURE_DOMAIN } from '../../data/dataset'
import type { CityId, TemperatureDay } from '../../data/types'
import { MONTH_LABELS, monthlyStats } from '../../lib/monthly'

const CHART_HEIGHT = 320
const MARGIN = { top: 16, right: 16, bottom: 12, left: 0 }

interface MonthlyRow {
  label: string
  values: Record<CityId, number | null>
}

function MonthlyTooltip({ active, row }: { active?: boolean; row?: MonthlyRow }) {
  if (!active || !row) return null
  return (
    <div className="chart-tooltip monthly-tooltip" data-testid="monthly-tooltip">
      <p className="tooltip-date">{row.label} 2025</p>
      <dl>
        {CITY_IDS.map((city) => (
          <div key={city} className="tooltip-value">
            <dt>{CITIES[city].name}</dt>
            <dd>{row.values[city] === null ? 'Unavailable' : `${row.values[city]!.toFixed(1)} °C`}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export default function MonthlyMeansChart({ days }: { days: readonly TemperatureDay[] }) {
  const rows = useMemo<MonthlyRow[]>(
    () =>
      MONTH_LABELS.map((label, monthIndex) => {
        const values = {} as Record<CityId, number | null>
        for (const city of CITY_IDS) values[city] = monthlyStats(days, city)[monthIndex].mean
        return { label, values }
      }),
    [days],
  )

  return (
    <figure aria-labelledby="monthly-title" aria-describedby="monthly-description">
      <div className="chart-heading">
        <h3 id="monthly-title">Monthly mean temperature <span>(°C)</span></h3>
        <div className="series-key" aria-label="City line styles">
          {CITY_IDS.map((city) => (
            <span key={city} className="series-item" style={{ color: CITIES[city].color }}>
              <svg width="26" height="10" aria-hidden="true"><line x1="0" y1="5" x2="26" y2="5" stroke="currentColor" strokeWidth="2.5" strokeDasharray={CITIES[city].dash} /></svg>
              {CITIES[city].name}<span className="sr-only">, {CITIES[city].pattern} line</span>
            </span>
          ))}
        </div>
      </div>
      <div className="chart-container" data-testid="monthly-chart">
        <ResponsiveContainer width="100%" height={CHART_HEIGHT} initialDimension={{ width: 300, height: CHART_HEIGHT }}>
          <LineChart
            data={rows}
            margin={MARGIN}
            accessibilityLayer
            aria-label="Monthly mean temperatures for all six cities. Use left and right arrow keys to inspect months."
          >
            <CartesianGrid vertical={false} stroke="var(--chart-rule)" strokeOpacity={0.1} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} height={30} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} interval={0} />
            <YAxis domain={TEMPERATURE_DOMAIN} ticks={Array.from({ length: (TEMPERATURE_DOMAIN[1] - TEMPERATURE_DOMAIN[0]) / 5 + 1 }, (_, index) => TEMPERATURE_DOMAIN[0] + index * 5)} width={36} tickLine={false} axisLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} allowDataOverflow />
            <Tooltip
              isAnimationActive={false}
              cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1, strokeDasharray: '3 3' }}
              content={(props) => <MonthlyTooltip active={props.active} row={props.payload?.[0]?.payload as MonthlyRow | undefined} />}
            />
            {CITY_IDS.map((city) => (
              <Line
                key={city}
                name={CITIES[city].name}
                type="linear"
                dataKey={`values.${city}`}
                stroke={CITIES[city].color}
                strokeDasharray={CITIES[city].dash}
                strokeWidth={2}
                dot={{ r: 2, strokeWidth: 0, fill: CITIES[city].color }}
                activeDot={{ r: 4, strokeWidth: 2 }}
                connectNulls={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <figcaption id="monthly-description" className="chart-caption">
        <p>Each point averages one calendar month of the synthetic data; months with gaps use their available days. The temperature scale matches the comparison page.</p>
      </figcaption>
    </figure>
  )
}
