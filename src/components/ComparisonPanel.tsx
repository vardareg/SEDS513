import { lazy, Suspense, useState } from 'react'
import { CITIES } from '../data/cities'
import type { CitySelection, DateRange, TemperatureDay } from '../data/types'
import { isCityPair } from '../lib/comparison'
import { formatDate } from '../lib/dates'
import { ComparisonTable } from './ComparisonTable'
import { CsvExportButton } from './CsvExportButton'

// The starting state has no chart: load its renderer only after a pair is chosen.
const TemperatureChart = lazy(() => import('./TemperatureChart').then((module) => ({ default: module.TemperatureChart })))
const DifferenceChart = lazy(() => import('./DifferenceChart'))

export function ComparisonPanel({ selection, days, range }: { selection: CitySelection; days: readonly TemperatureDay[]; range: DateRange }) {
  const ready = isCityPair(selection)
  const chosen = selection.filter((city) => city !== null)
  const [showDifference, setShowDifference] = useState(true)
  return (
    <section className="comparison-panel" aria-labelledby="comparison-heading">
      <header className="comparison-header">
        <h2 id="comparison-heading" className="step-heading"><span className="step-number">3</span> Compare temperatures</h2>
        <p id="applied-summary" className="applied-summary" aria-live="polite" aria-atomic="true">
          {ready ? <><strong>{CITIES[selection[0]].name} and {CITIES[selection[1]].name}</strong><span>Applied: {formatDate(range.start)} – {formatDate(range.end)}</span><span>{days.length} {days.length === 1 ? 'day' : 'days'}</span></> : <>Applied dates: {formatDate(range.start)} – {formatDate(range.end)}</>}
        </p>
      </header>
      {ready ? (
        days.length > 0 ? <>
          <Suspense fallback={<p role="status" className="empty-guidance">Preparing temperature chart…</p>}><TemperatureChart days={days} pair={selection} /></Suspense>
          <div className="comparison-toolbar">
            <label className="difference-toggle">
              <input
                type="checkbox"
                checked={showDifference}
                onChange={(event) => setShowDifference(event.target.checked)}
                data-testid="difference-toggle"
              />
              Show daily difference ({CITIES[selection[0]].name} − {CITIES[selection[1]].name})
            </label>
            <CsvExportButton days={days} pair={selection} range={range} />
          </div>
          {showDifference ? (
            <Suspense fallback={<p role="status" className="empty-guidance">Preparing difference chart…</p>}><DifferenceChart days={days} pair={selection} /></Suspense>
          ) : null}
          <ComparisonTable days={days} pair={selection} range={range} />
        </> : <p className="empty-guidance">No daily values are available in this range. Choose dates within 2025.</p>
      ) : (
        <div className="empty-guidance" role="status" aria-live="polite">
          <span className="empty-marker" aria-hidden="true">{chosen.length} / 2</span>
          <h3>{chosen.length === 0 ? 'Your comparison starts with two cities' : 'Choose one more city'}</h3>
          <p>{chosen.length === 0 ? 'Choose City 1 and City 2 above to explore their daily temperature patterns.' : `${CITIES[chosen[0]].name} is selected. Choose a different city in the other field.`}</p>
          <p className="empty-note">Both cities will share the same dates and temperature scale.</p>
        </div>
      )}
    </section>
  )
}
