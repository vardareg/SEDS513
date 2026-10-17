import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { CITIES, CITY_IDS } from '../../data/cities'
import { DATASET_METADATA, TEMPERATURE_DAYS } from '../../data/dataset'
import type { CityId, TemperatureDay } from '../../data/types'
import { formatDate } from '../../lib/dates'
import { monthlyStats } from '../../lib/monthly'
import { summarizeCity } from '../../lib/stats'
import { Button } from '../ui/button'
import { NativeSelect, NativeSelectOption } from '../ui/native-select'
import { CitySparkline } from './CitySparkline'

export function CityCard({ city, days = TEMPERATURE_DAYS }: { city: CityId; days?: readonly TemperatureDay[] }) {
  const navigate = useNavigate()
  const others = CITY_IDS.filter((other) => other !== city)
  const [partner, setPartner] = useState<CityId>(others[0])
  const summary = summarizeCity(days, city)
  const monthly = monthlyStats(days, city).map((month) => month.mean)
  const gaps = DATASET_METADATA.knownGaps[city]
  const { baseline, amplitude } = DATASET_METADATA.parameters[city]

  function compare() {
    navigate(`/?from=${city}&to=${partner}`)
  }

  return (
    <li className="city-profile" data-city={city}>
      <div className="city-identity">
        <span className="series-item" style={{ color: CITIES[city].color }}>
          <svg width="26" height="10" aria-hidden="true"><line x1="0" y1="5" x2="26" y2="5" stroke="currentColor" strokeWidth="2.5" strokeDasharray={CITIES[city].dash} /></svg>
          {CITIES[city].name}<span className="sr-only">, {CITIES[city].pattern} line</span>
        </span>
        <span className="city-region">{CITIES[city].region}</span>
      </div>
      <dl className="city-facts">
        <div><dt>Annual mean</dt><dd data-stat="mean">{summary.mean === null ? '—' : `${summary.mean.toFixed(1)} °C`}</dd></div>
        <div><dt>Coldest to warmest</dt><dd>{summary.min === null || summary.max === null ? '—' : `${summary.min.toFixed(1)} to ${summary.max.toFixed(1)} °C`}</dd></div>
        <div><dt>Model inputs</dt><dd>baseline {baseline} °C, ±{amplitude} seasonal</dd></div>
        <div><dt>Missing days</dt><dd>
          {gaps.length === 0 ? 'none' : (
            <span title={gaps.map((date) => formatDate(date)).join(', ')}>{gaps.length} ({formatDate(gaps[0])} – {formatDate(gaps.at(-1)!)})</span>
          )}
        </dd></div>
      </dl>
      <div className="city-sparkline-wrap">
        <CitySparkline values={monthly} color={CITIES[city].color} />
        <span className="city-sparkline-label">monthly means, Jan–Dec</span>
      </div>
      <div className="city-compare">
        <label htmlFor={`compare-${city}`}>Compare with</label>
        <NativeSelect id={`compare-${city}`} name={`compare-${city}`} value={partner} onChange={(event) => setPartner(event.target.value as CityId)}>
          {others.map((other) => (
            <NativeSelectOption key={other} value={other}>{CITIES[other].name}</NativeSelectOption>
          ))}
        </NativeSelect>
        <Button variant="outline" size="sm" type="button" onClick={compare} data-testid={`compare-link-${city}`}>
          Compare<ArrowRight aria-hidden="true" data-icon="inline-end" />
        </Button>
      </div>
    </li>
  )
}
