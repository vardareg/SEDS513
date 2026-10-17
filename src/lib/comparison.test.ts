import { describe, expect, it } from 'vitest'
import bundled from '../data/temperatures-2025.json'
import { generateDataset } from '../data/generate'
import type { TemperatureDay } from '../data/types'
import { CITY_IDS } from '../data/cities'
import { chartDays, endpointLabelValues, filterDays, formatTemperature, isCityPair, temperatureDomain } from './comparison'
import { DATA_RANGE, DAY_MS, dateTimestamp, formatDate, isValidDate, rangesEqual, validateDateRange } from './dates'

const fixture: TemperatureDay[] = [
  { date: '2025-01-31', temperaturesC: { izmir: 8.5, ankara: -2, istanbul: 5, antalya: 9.4, erzurum: -4.2, van: 2.1 } },
  { date: '2025-02-01', temperaturesC: { izmir: null, ankara: 0, istanbul: 6, antalya: 10, erzurum: -3.9, van: 1.8 } },
  { date: '2025-02-02', temperaturesC: { izmir: 9.2, ankara: 1, istanbul: 7, antalya: 10.8, erzurum: -4.6, van: 2.6 } },
]

describe('bundled synthetic data', () => {
  it('reproduces the complete bundled artifact from its seed', () => {
    expect(generateDataset()).toEqual(bundled)
    expect(generateDataset(123)).not.toEqual(bundled)
  })

  it('has 365 unique, consecutive dates and one value per city on every date', () => {
    expect(bundled.days).toHaveLength(365)
    expect(new Set(bundled.days.map((day) => day.date)).size).toBe(365)
    expect(bundled.days[0].date).toBe('2025-01-01')
    expect(bundled.days.at(-1)?.date).toBe('2025-12-31')
    bundled.days.forEach((day, index) => {
      expect(Object.keys(day.temperaturesC)).toEqual(CITY_IDS)
      expect(isValidDate(day.date)).toBe(true)
      if (index > 0) expect(dateTimestamp(day.date) - dateTimestamp(bundled.days[index - 1].date)).toBe(DAY_MS)
    })
    expect(bundled.days.length * CITY_IDS.length).toBe(2190)
  })

  it('keeps missing values exactly on the documented gap days', () => {
    const gapKeys = new Set<string>()
    for (const city of CITY_IDS) {
      for (const date of bundled.metadata.knownGaps[city]) gapKeys.add(`${date}:${city}`)
    }
    const actualNulls: string[] = []
    let missingTotal = 0
    for (const day of bundled.days) {
      for (const city of CITY_IDS) {
        if (day.temperaturesC[city] === null) {
          actualNulls.push(`${day.date}:${city}`)
          missingTotal += 1
        }
      }
    }
    expect(actualNulls.sort()).toEqual([...gapKeys].sort())
    expect(missingTotal).toBe(8)
  })

  it('keeps each value within its documented seasonal and noise bounds', () => {
    for (const city of CITY_IDS) {
      const { baseline, amplitude } = bundled.metadata.parameters[city]
      for (const day of bundled.days) {
        const value = day.temperaturesC[city]
        if (value === null) continue
        expect(value).toBeGreaterThanOrEqual(baseline - amplitude - 2)
        expect(value).toBeLessThanOrEqual(baseline + amplitude + 2)
      }
    }
  })
})

describe('calendar dates and filtering', () => {
  it.each(['', '2025-02-29', '2025-04-31', '2025-13-01', '2025-1-01', 'invalid'])('rejects invalid calendar date %s', (date) => {
    expect(isValidDate(date)).toBe(false)
  })

  it('uses inclusive boundaries across a month change without mutating input', () => {
    expect(filterDays(fixture, { start: '2025-01-31', end: '2025-02-01' })).toEqual(fixture.slice(0, 2))
    expect(filterDays(fixture, { start: '2025-02-01', end: '2025-02-01' })).toEqual([fixture[1]])
    expect(filterDays(bundled.days, DATA_RANGE)).toHaveLength(365)
    expect(filterDays(fixture, { start: '2025-03-01', end: '2025-03-02' })).toEqual([])
    expect(fixture).toHaveLength(3)
  })

  it('reports missing dates, bounds, and reversed ranges without changing them', () => {
    expect(validateDateRange({ start: '', end: '' })).toEqual({ start: 'Choose a start date.', end: 'Choose an end date.' })
    expect(validateDateRange({ start: '2024-12-31', end: '2026-01-01' })).toHaveProperty('start')
    expect(validateDateRange({ start: '2025-02-29', end: '2025-03-01' })).toHaveProperty('start')
    expect(validateDateRange({ start: '2025-04-01', end: '2025-03-01' })).toHaveProperty('end')
    expect(validateDateRange({ start: '2025-02-01', end: '2025-02-01' })).toEqual({})
    expect(validateDateRange(DATA_RANGE)).toEqual({})
  })

  it('formats and plots calendar days in UTC', () => {
    expect(formatDate('2025-01-01')).toBe('1 Jan 2025')
    expect(formatDate('2025-12-31')).toBe('31 Dec 2025')
    expect(chartDays(fixture)[0].timestamp).toBe(Date.UTC(2025, 0, 31))
    expect(rangesEqual(DATA_RANGE, { ...DATA_RANGE })).toBe(true)
    expect(rangesEqual(DATA_RANGE, { start: '2025-02-01', end: DATA_RANGE.end })).toBe(false)
  })
})

describe('comparison contracts', () => {
  it.each([
    ['izmir', 'ankara'], ['izmir', 'istanbul'], ['ankara', 'istanbul'], ['antalya', 'erzurum'], ['van', 'antalya'],
  ] as const)('accepts the distinct pair %s / %s', (first, second) => {
    expect(isCityPair([first, second])).toBe(true)
  })

  it('rejects empty, partial, and duplicate selections', () => {
    expect(isCityPair([null, null])).toBe(false)
    expect(isCityPair(['izmir', null])).toBe(false)
    expect(isCityPair([null, 'ankara'])).toBe(false)
    expect(isCityPair(['izmir', 'izmir'])).toBe(false)
  })

  it('preserves gaps and zero values when preparing chart rows', () => {
    expect(chartDays(fixture)[1].temperaturesC).toEqual({ izmir: null, ankara: 0, istanbul: 6, antalya: 10, erzurum: -3.9, van: 1.8 })
    expect(formatTemperature(null)).toBe('Unavailable')
    expect(formatTemperature(NaN)).toBe('Unavailable')
    expect(formatTemperature(0)).toBe('0.0 °C')
    expect(formatTemperature(-2)).toBe('-2.0 °C')
  })

  it('rounds the full-data scale outward and handles absent values', () => {
    expect(temperatureDomain(fixture)).toEqual([-5, 15])
    const domain = temperatureDomain(bundled.days)
    expect(domain).toEqual([-10, 35])
    for (const day of bundled.days) for (const city of CITY_IDS) {
      const value = day.temperaturesC[city]
      if (value === null) continue
      expect(value).toBeGreaterThanOrEqual(domain[0])
      expect(value).toBeLessThanOrEqual(domain[1])
    }
    expect(temperatureDomain([])).toEqual([0, 5])
    expect(temperatureDomain([{ ...fixture[0], temperaturesC: { izmir: null, ankara: null, istanbul: null, antalya: null, erzurum: null, van: null } }])).toEqual([0, 5])
  })

  it('separates colliding endpoint labels while preserving their order', () => {
    const positions = endpointLabelValues([8, 8.1], [-5, 35])
    expect(positions[1] - positions[0]).toBeGreaterThanOrEqual(3)
    expect(endpointLabelValues([8, 20], [-5, 35])).toEqual([8, 20])
    expect(endpointLabelValues([8.1, 8], [-5, 35])[0]).toBeGreaterThan(endpointLabelValues([8.1, 8], [-5, 35])[1])
  })
})
