import { useMemo, useRef, useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { CityPairControls } from './components/CityPairControls'
import { DateRangeForm } from './components/DateRangeForm'
import { ComparisonPanel } from './components/ComparisonPanel'
import { TEMPERATURE_DAYS } from './data/dataset'
import type { CityId, CitySelection, DateRange } from './data/types'
import { filterDays } from './lib/comparison'
import { DATA_RANGE } from './lib/dates'

export default function App() {
  const [selection, setSelection] = useState<CitySelection>([null, null])
  const [appliedRange, setAppliedRange] = useState<DateRange>({ ...DATA_RANGE })
  const [resetVersion, setResetVersion] = useState(0)
  const [resetAnnouncement, setResetAnnouncement] = useState('')
  const firstCityRef = useRef<HTMLSelectElement>(null)
  const days = useMemo(() => filterDays(TEMPERATURE_DAYS, appliedRange), [appliedRange])

  function selectCity(slot: 0 | 1, city: CityId | null) {
    setSelection((previous) => {
      if (city !== null && previous[1 - slot] === city) return previous
      return slot === 0 ? [city, previous[1]] : [previous[0], city]
    })
    setResetAnnouncement('')
  }

  function resetAll() {
    setSelection([null, null])
    setAppliedRange({ ...DATA_RANGE })
    setResetVersion((previous) => previous + 1)
    setResetAnnouncement('All selections reset. Choose two cities to start again.')
    firstCityRef.current?.focus()
  }

  return (
    <>
      <a href="#explorer" className="skip-link">Skip to explorer</a>
      <div className="page-shell">
        <header className="page-header">
          <p className="course-label">SEDS 513 <span>Principles of Human–Computer Interaction</span></p>
          <h1>Scientific Time-Series Explorer</h1>
          <p className="page-intro">Choose two cities. Set a date range. Explore the patterns.</p>
        </header>

        <aside className="synthetic-notice" aria-labelledby="dataset-notice-title">
          <FlaskConical size={21} aria-hidden="true" className="notice-icon" />
          <div><h2 id="dataset-notice-title">Synthetic teaching data</h2><p>Simulated daily means for 2025. These values are not meteorological observations.</p></div>
        </aside>

        <main id="explorer" tabIndex={-1}>
          <div className="controls-panel">
            <CityPairControls selection={selection} onChange={selectCity} firstSelectRef={firstCityRef} />
            <DateRangeForm key={resetVersion} applied={appliedRange} onApply={setAppliedRange} onReset={resetAll} />
          </div>
          <p className="sr-only" role="status">{resetAnnouncement}</p>
          <ComparisonPanel selection={selection} days={days} range={appliedRange} />
        </main>

        <footer className="page-footer"><span>İzmir Institute of Technology</span><span>SEDS 513 · HCI teaching prototype</span></footer>
      </div>
    </>
  )
}
