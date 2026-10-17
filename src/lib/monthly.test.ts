import { describe, expect, it } from 'vitest'
import type { TemperatureDay } from '../data/types'
import bundled from '../data/temperatures-2025.json'
import { MONTH_LABELS, monthlyStats } from './monthly'

const fixture: TemperatureDay[] = [
  { date: '2025-01-30', temperaturesC: { izmir: 8.4, ankara: -2.4, istanbul: 5.2, antalya: 9.4, erzurum: -4.2, van: 2.1 } },
  { date: '2025-01-31', temperaturesC: { izmir: 8.6, ankara: -2, istanbul: 5, antalya: 9.5, erzurum: -4.4, van: 2.3 } },
  { date: '2025-02-01', temperaturesC: { izmir: null, ankara: 0, istanbul: 6, antalya: 10, erzurum: -3.9, van: 1.8 } },
  { date: '2025-02-02', temperaturesC: { izmir: 9.2, ankara: 1, istanbul: 7, antalya: 10.8, erzurum: -4.6, van: 2.6 } },
]

describe('monthly aggregation', () => {
  it('always returns twelve labeled rows in calendar order', () => {
    const rows = monthlyStats([], 'izmir')
    expect(rows).toHaveLength(12)
    expect(rows.map((row) => row.label)).toEqual([...MONTH_LABELS])
    expect(rows.every((row) => row.count === 0 && row.mean === null && row.min === null && row.max === null)).toBe(true)
  })

  it('groups by the UTC month of the date string and skips gaps', () => {
    const rows = monthlyStats(fixture, 'izmir')
    expect(rows[0]).toMatchObject({ month: 1, label: 'Jan', count: 2, mean: 8.5, min: 8.4, max: 8.6 })
    expect(rows[1]).toMatchObject({ month: 2, count: 1, mean: 9.2, min: 9.2, max: 9.2 })
    expect(rows[2].count).toBe(0)
  })

  it('aggregates the bundled dataset with its documented January gap', () => {
    const erzurum = monthlyStats(bundled.days, 'erzurum')
    expect(erzurum[0].count).toBe(28)
    expect(erzurum[2].count).toBe(31)
    const van = monthlyStats(bundled.days, 'van')
    expect(van[6].count).toBe(28)
  })
})
