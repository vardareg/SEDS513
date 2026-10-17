import { useMemo } from 'react'
import { CITIES, CITY_IDS } from '../../data/cities'
import { TEMPERATURE_DOMAIN } from '../../data/dataset'
import type { TemperatureDay } from '../../data/types'
import { formatTemperature } from '../../lib/comparison'
import { cityValues, histogram } from '../../lib/stats'

const BIN_WIDTH = 2

export function DistributionGrid({ days }: { days: readonly TemperatureDay[] }) {
  const panels = useMemo(
    () =>
      CITY_IDS.map((city) => {
        const values = cityValues(days, city)
        const bins = histogram(values, TEMPERATURE_DOMAIN, BIN_WIDTH)
        const peak = Math.max(...bins.map((bin) => bin.count))
        const mean = values.reduce((sum, value) => sum + value, 0) / values.length
        const meanPercent = ((mean - TEMPERATURE_DOMAIN[0]) / (TEMPERATURE_DOMAIN[1] - TEMPERATURE_DOMAIN[0])) * 100
        return { city, bins, peak, mean, meanPercent }
      }),
    [days],
  )

  return (
    <div className="distribution-grid" data-testid="distribution-grid">
      {panels.map(({ city, bins, peak, mean, meanPercent }) => (
        <figure key={city} className="distribution-panel" role="img" aria-label={`Distribution of simulated daily mean temperatures for ${CITIES[city].name}: mean ${mean.toFixed(1)} degrees Celsius on a scale from ${TEMPERATURE_DOMAIN[0]} to ${TEMPERATURE_DOMAIN[1]} degrees.`}>
          <figcaption className="distribution-header">
            <span className="series-item" style={{ color: CITIES[city].color }}>
              <svg width="22" height="10" aria-hidden="true"><line x1="0" y1="5" x2="22" y2="5" stroke="currentColor" strokeWidth="2.5" strokeDasharray={CITIES[city].dash} /></svg>
              {CITIES[city].name}
            </span>
            <span className="distribution-summary">mean {mean.toFixed(1)} °C</span>
          </figcaption>
          <div className="distribution-bars" aria-hidden="true">
            {bins.map((bin) => (
              <span
                key={bin.from}
                className="distribution-bar"
                style={{
                  height: peak === 0 ? 0 : `${(bin.count / peak) * 100}%`,
                  background: CITIES[city].color,
                  opacity: bin.count === 0 ? 0.12 : 0.68,
                }}
                title={`${bin.from} to ${bin.to} °C: ${bin.count} ${bin.count === 1 ? 'day' : 'days'}`}
              />
            ))}
            <span className="distribution-mean" style={{ left: `${meanPercent}%` }} title={`Mean ${formatTemperature(mean)}`} />
          </div>
          <div className="distribution-axis" aria-hidden="true">
            <span>{TEMPERATURE_DOMAIN[0]} °C</span>
            <span>{TEMPERATURE_DOMAIN[1]} °C</span>
          </div>
        </figure>
      ))}
    </div>
  )
}
