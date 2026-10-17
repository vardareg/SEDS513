import type { CityId, TemperatureDay } from '../data/types'

export interface CitySummary {
  city: CityId
  count: number
  missing: number
  mean: number | null
  median: number | null
  stdDev: number | null
  min: number | null
  max: number | null
}

/** All finite values for one city; nulls are skipped, never coerced. */
export function cityValues(days: readonly TemperatureDay[], city: CityId): number[] {
  const values: number[] = []
  for (const day of days) {
    const value = day.temperaturesC[city]
    if (value !== null && Number.isFinite(value)) values.push(value)
  }
  return values
}

export function mean(values: readonly number[]): number | null {
  if (values.length === 0) return null
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export function median(values: readonly number[]): number | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

/** Sample standard deviation (n − 1); null for fewer than two values. */
export function stdDev(values: readonly number[]): number | null {
  if (values.length < 2) return null
  const average = mean(values)!
  const variance = values.reduce((sum, value) => sum + (value - average) ** 2, 0) / (values.length - 1)
  return Math.sqrt(variance)
}

export function minMax(values: readonly number[]): [number, number] | null {
  if (values.length === 0) return null
  return [Math.min(...values), Math.max(...values)]
}

export function summarizeCity(days: readonly TemperatureDay[], city: CityId): CitySummary {
  const values = cityValues(days, city)
  const range = minMax(values)
  return {
    city,
    count: values.length,
    missing: days.length - values.length,
    mean: mean(values),
    median: median(values),
    stdDev: stdDev(values),
    min: range?.[0] ?? null,
    max: range?.[1] ?? null,
  }
}

export interface HistogramBin {
  from: number
  to: number
  count: number
}

/** Equal-width bins covering the domain; values on the boundary land in the bin they open. */
export function histogram(values: readonly number[], domain: readonly [number, number], binWidth: number): HistogramBin[] {
  const bins: HistogramBin[] = []
  for (let edge = domain[0]; edge < domain[1]; edge += binWidth) {
    bins.push({ from: edge, to: Math.min(domain[1], edge + binWidth), count: 0 })
  }
  if (bins.length === 0) return bins
  for (const value of values) {
    const clamped = Math.min(domain[1], Math.max(domain[0], value))
    const index = Math.min(bins.length - 1, Math.floor((clamped - domain[0]) / binWidth))
    bins[index].count += 1
  }
  return bins
}
