import type { ChartDay, CityPair, CitySelection, DateRange, TemperatureDay } from '../data/types'
import { CITY_IDS } from '../data/cities'
import { dateTimestamp } from './dates'

export function isCityPair(selection: CitySelection): selection is CityPair {
  return selection[0] !== null && selection[1] !== null && selection[0] !== selection[1]
}

export function filterDays(days: readonly TemperatureDay[], range: DateRange): TemperatureDay[] {
  return days.filter(({ date }) => date >= range.start && date <= range.end)
}

export function chartDays(days: readonly TemperatureDay[]): ChartDay[] {
  return days.map((day) => ({ ...day, timestamp: dateTimestamp(day.date) }))
}

export function temperatureDomain(days: readonly TemperatureDay[]): [number, number] {
  let min = Infinity
  let max = -Infinity
  for (const day of days) {
    for (const city of CITY_IDS) {
      const value = day.temperaturesC[city]
      if (value !== null && Number.isFinite(value)) {
        min = Math.min(min, value)
        max = Math.max(max, value)
      }
    }
  }
  if (!Number.isFinite(min)) return [0, 5]
  const lower = Math.floor(min / 5) * 5
  return [lower, Math.max(lower + 5, Math.ceil(max / 5) * 5)]
}

export function formatTemperature(value: number | null): string {
  return value === null || !Number.isFinite(value) ? 'Unavailable' : `${value.toFixed(1)} °C`
}

/** Separate two endpoint labels without changing either plotted temperature. */
export function endpointLabelValues(values: readonly [number, number], domain: readonly [number, number]): [number, number] {
  const gap = (domain[1] - domain[0]) * 0.075
  if (Math.abs(values[0] - values[1]) >= gap) return [...values]
  const midpoint = (values[0] + values[1]) / 2
  const low = Math.max(domain[0] + gap / 2, Math.min(domain[1] - gap * 1.5, midpoint - gap / 2))
  return values[0] <= values[1] ? [low, low + gap] : [low + gap, low]
}
