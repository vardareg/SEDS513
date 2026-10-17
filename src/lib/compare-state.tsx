import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { CityId, CitySelection, DateRange } from '../data/types'
import { DATA_RANGE } from './dates'

interface CompareState {
  selection: CitySelection
  appliedRange: DateRange
  /** Bumped whenever the range changes from outside the date form (presets, links, reset) so the form can resync its draft. */
  revision: number
  selectCity: (slot: 0 | 1, city: CityId | null) => void
  setSelection: (selection: CitySelection) => void
  swapCities: () => void
  /** Apply from the form's own submission: the draft already holds these dates. */
  applyRange: (range: DateRange) => void
  /** Apply from anywhere else: also remounts the form with the new range. */
  applyRangeExternally: (range: DateRange) => void
  resetAll: () => void
}

const CompareContext = createContext<CompareState | null>(null)

export function CompareProvider({ children }: { children: ReactNode }) {
  const [selection, setSelection] = useState<CitySelection>([null, null])
  const [appliedRange, setAppliedRange] = useState<DateRange>({ ...DATA_RANGE })
  const [revision, setRevision] = useState(0)

  const value = useMemo<CompareState>(
    () => ({
      selection,
      appliedRange,
      revision,
      selectCity: (slot, city) =>
        setSelection((previous) => {
          if (city !== null && previous[1 - slot] === city) return previous
          return slot === 0 ? [city, previous[1]] : [previous[0], city]
        }),
      setSelection,
      swapCities: () => setSelection(([first, second]) => [second, first]),
      applyRange: (range) => setAppliedRange(range),
      applyRangeExternally: (range) => {
        setAppliedRange(range)
        setRevision((previous) => previous + 1)
      },
      resetAll: () => {
        setSelection([null, null])
        setAppliedRange({ ...DATA_RANGE })
        setRevision((previous) => previous + 1)
      },
    }),
    [selection, appliedRange, revision],
  )

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
}

export function useCompare(): CompareState {
  const context = useContext(CompareContext)
  if (!context) throw new Error('useCompare must be used within CompareProvider')
  return context
}
