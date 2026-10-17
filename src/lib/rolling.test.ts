import { describe, expect, it } from 'vitest'
import type { TemperatureDay } from '../data/types'
import { rollingMean } from './rolling'

const fixture: TemperatureDay[] = [
  { date: '2025-01-30', temperaturesC: { izmir: 8.4, ankara: -2.4, istanbul: 5.2, antalya: 9.4, erzurum: -4.2, van: 2.1 } },
  { date: '2025-01-31', temperaturesC: { izmir: 8.6, ankara: -2, istanbul: 5, antalya: 9.5, erzurum: -4.4, van: 2.3 } },
  { date: '2025-02-01', temperaturesC: { izmir: null, ankara: 0, istanbul: 6, antalya: 10, erzurum: -3.9, van: 1.8 } },
  { date: '2025-02-02', temperaturesC: { izmir: 9.2, ankara: 1, istanbul: 7, antalya: 10.8, erzurum: -4.6, van: 2.6 } },
]

describe('rolling means', () => {
  it('returns one row per day, null until the window is full', () => {
    const result = rollingMean(fixture, 'ankara', 2)
    expect(result.map((day) => day.date)).toEqual(fixture.map((day) => day.date))
    expect(result[0].value).toBeNull()
    expect(result[1].value).toBe(-2.2)
    expect(result[2].value).toBe(-1)
    expect(result[3].value).toBe(0.5)
  })

  it('yields null for any window that contains a gap', () => {
    const result = rollingMean(fixture, 'izmir', 2)
    expect(result[1].value).toBe(8.5)
    expect(result[2].value).toBeNull()
    expect(result[3].value).toBeNull()
    expect(rollingMean(fixture, 'izmir', 3)[3].value).toBeNull()
  })

  it('rounds to one decimal like the dataset', () => {
    expect(rollingMean([{ ...fixture[0] }, { ...fixture[1] }, { ...fixture[2] }] as TemperatureDay[], 'istanbul', 3)[2].value).toBeCloseTo(5.4, 1)
  })

  it('treats a window of one as the series itself and rejects zero windows', () => {
    expect(rollingMean(fixture, 'van', 1).map((day) => day.value)).toEqual([2.1, 2.3, 1.8, 2.6])
    expect(rollingMean(fixture, 'van', 0)).toEqual([])
  })
})
