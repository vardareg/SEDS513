import { describe, expect, it } from 'vitest'
import type { TemperatureDay } from '../data/types'
import { CITY_IDS } from '../data/cities'
import bundled from '../data/temperatures-2025.json'
import { cityValues, histogram, mean, median, minMax, stdDev, summarizeCity } from './stats'

const fixture: TemperatureDay[] = [
  { date: '2025-01-30', temperaturesC: { izmir: 8.4, ankara: -2.4, istanbul: 5.2, antalya: 9.4, erzurum: -4.2, van: 2.1 } },
  { date: '2025-01-31', temperaturesC: { izmir: 8.6, ankara: -2, istanbul: 5, antalya: 9.5, erzurum: -4.4, van: null } },
  { date: '2025-02-01', temperaturesC: { izmir: null, ankara: 0, istanbul: 6, antalya: 10, erzurum: -3.9, van: 1.8 } },
  { date: '2025-02-02', temperaturesC: { izmir: 9.2, ankara: 1, istanbul: 7, antalya: 10.8, erzurum: -4.6, van: 2.6 } },
]

describe('summary statistics', () => {
  it('skips missing values when collecting a city series', () => {
    expect(cityValues(fixture, 'izmir')).toEqual([8.4, 8.6, 9.2])
    expect(cityValues(fixture, 'van')).toEqual([2.1, 1.8, 2.6])
    expect(cityValues([], 'izmir')).toEqual([])
  })

  it('computes mean, median, spread, and extremes with empty-input nulls', () => {
    expect(mean([1, 2, 3])).toBe(2)
    expect(mean([])).toBeNull()
    expect(median([3, 1, 2])).toBe(2)
    expect(median([4, 1, 3, 2])).toBe(2.5)
    expect(median([])).toBeNull()
    expect(stdDev([5])).toBeNull()
    expect(stdDev([2, 4, 4, 4, 5, 5, 7, 9])!).toBeCloseTo(2.138, 3)
    expect(minMax([3, -1, 2])).toEqual([-1, 3])
    expect(minMax([])).toBeNull()
  })

  it('summarizes a city with its missing-day count', () => {
    const summary = summarizeCity(fixture, 'izmir')
    expect(summary).toMatchObject({ city: 'izmir', count: 3, missing: 1, min: 8.4, max: 9.2 })
    expect(summary.mean!).toBeCloseTo(8.733, 3)
    expect(summary.median).toBe(8.6)
    expect(summarizeCity([], 'izmir')).toMatchObject({ count: 0, missing: 0, mean: null, median: null, stdDev: null, min: null, max: null })
  })

  it('bins values into equal-width bins across the domain', () => {
    const bins = histogram([0, 1.9, 2, 5, 10], [0, 10], 2)
    expect(bins.map((bin) => bin.count)).toEqual([2, 1, 1, 0, 1])
    expect(bins[0]).toMatchObject({ from: 0, to: 2 })
    expect(bins.at(-1)).toMatchObject({ from: 8, to: 10 })
    expect(histogram([], [0, 10], 2).every((bin) => bin.count === 0)).toBe(true)
    expect(histogram([3], [0, 0], 2)).toEqual([])
  })

  it('clamps out-of-domain values into the edge bins', () => {
    const bins = histogram([-5, 15], [0, 10], 5)
    expect(bins.map((bin) => bin.count)).toEqual([1, 1])
  })

  it('reports the documented gaps as missing on the bundled dataset', () => {
    for (const city of CITY_IDS) {
      const summary = summarizeCity(bundled.days, city)
      expect(summary.count).toBe(365 - bundled.metadata.knownGaps[city].length)
      expect(summary.missing).toBe(bundled.metadata.knownGaps[city].length)
      expect(summary.min!).toBeGreaterThanOrEqual(bundled.metadata.parameters[city].baseline - bundled.metadata.parameters[city].amplitude - 2)
      expect(summary.max!).toBeLessThanOrEqual(bundled.metadata.parameters[city].baseline + bundled.metadata.parameters[city].amplitude + 2)
    }
  })
})
