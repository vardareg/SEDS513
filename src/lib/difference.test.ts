import { describe, expect, it } from 'vitest'
import type { TemperatureDay } from '../data/types'
import { dailyDifference, differenceDomain } from './difference'

const fixture: TemperatureDay[] = [
  { date: '2025-01-30', temperaturesC: { izmir: 8.4, ankara: -2.4, istanbul: 5.2, antalya: 9.4, erzurum: -4.2, van: 2.1 } },
  { date: '2025-01-31', temperaturesC: { izmir: 8.6, ankara: -2, istanbul: 5, antalya: 9.5, erzurum: -4.4, van: null } },
  { date: '2025-02-01', temperaturesC: { izmir: null, ankara: 0, istanbul: 6, antalya: 10, erzurum: -3.9, van: 1.8 } },
  { date: '2025-02-02', temperaturesC: { izmir: 9.2, ankara: 1, istanbul: 7.3, antalya: 10.8, erzurum: -4.6, van: 2.6 } },
]

describe('daily differences', () => {
  it('subtracts the second city from the first and rounds to one decimal', () => {
    const result = dailyDifference(fixture, ['izmir', 'antalya'])
    expect(result.map((day) => day.difference)).toEqual([-1, -0.9, null, -1.6])
  })

  it('is null whenever either side is missing', () => {
    expect(dailyDifference(fixture, ['izmir', 'van'])[2].difference).toBeNull()
    expect(dailyDifference(fixture, ['van', 'izmir'])[1].difference).toBeNull()
  })

  it('avoids floating-point artifacts at one decimal', () => {
    const [only] = dailyDifference([fixture[3]], ['istanbul', 'erzurum'])
    expect(only.difference).toBe(11.9)
  })

  it('derives a symmetric domain rounded outward to five', () => {
    expect(differenceDomain([{ date: '2025-01-01', difference: -1.6 }, { date: '2025-01-02', difference: 0.4 }])).toEqual([-5, 5])
    expect(differenceDomain([{ date: '2025-01-01', difference: 12.3 }])).toEqual([-15, 15])
    expect(differenceDomain([])).toEqual([-5, 5])
    expect(differenceDomain([{ date: '2025-01-01', difference: null }])).toEqual([-5, 5])
  })
})
