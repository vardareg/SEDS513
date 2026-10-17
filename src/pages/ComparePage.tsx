import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CityPairControls } from '../components/CityPairControls'
import { DateRangeForm } from '../components/DateRangeForm'
import { ComparisonPanel } from '../components/ComparisonPanel'
import { isCityId } from '../data/cities'
import { TEMPERATURE_DAYS } from '../data/dataset'
import type { CityId } from '../data/types'
import { filterDays } from '../lib/comparison'
import { useCompare } from '../lib/compare-state'
import { validateDateRange } from '../lib/dates'
import { usePageTitle } from '../lib/usePageTitle'

export default function ComparePage() {
  usePageTitle('Compare')
  const { selection, setSelection, selectCity, swapCities, appliedRange, applyRange, applyRangeExternally, resetAll, revision } = useCompare()
  const [searchParams, setSearchParams] = useSearchParams()
  const [resetAnnouncement, setResetAnnouncement] = useState('')
  const firstCityRef = useRef<HTMLSelectElement>(null)
  const seeded = useRef(false)
  const days = useMemo(() => filterDays(TEMPERATURE_DAYS, appliedRange), [appliedRange])

  // A hand-off link (?from=&to=&start=&end=) seeds the comparison once, then the
  // URL is cleared so a later refresh keeps the current selections.
  useEffect(() => {
    if (seeded.current) return
    seeded.current = true
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const start = searchParams.get('start')
    const end = searchParams.get('end')
    let consumed = false
    if (from !== null && to !== null && isCityId(from) && isCityId(to) && from !== to) {
      setSelection([from, to])
      consumed = true
    }
    if (start !== null && end !== null) {
      const range = { start, end }
      if (Object.keys(validateDateRange(range)).length === 0) {
        applyRangeExternally(range)
        consumed = true
      }
    }
    if (consumed) setSearchParams({}, { replace: true })
  }, [searchParams, setSearchParams, setSelection, applyRangeExternally])

  function handleSelectCity(slot: 0 | 1, city: CityId | null) {
    selectCity(slot, city)
    setResetAnnouncement('')
  }

  function handleResetAll() {
    resetAll()
    setResetAnnouncement('All selections reset. Choose two cities to start again.')
    firstCityRef.current?.focus()
  }

  return (
    <main id="explorer" tabIndex={-1}>
      <div className="controls-panel">
        <CityPairControls selection={selection} onChange={handleSelectCity} onSwap={swapCities} firstSelectRef={firstCityRef} />
        <DateRangeForm key={revision} applied={appliedRange} onApply={applyRange} onApplyExternal={applyRangeExternally} onReset={handleResetAll} />
      </div>
      <p className="sr-only" role="status">{resetAnnouncement}</p>
      <ComparisonPanel selection={selection} days={days} range={appliedRange} />
    </main>
  )
}
