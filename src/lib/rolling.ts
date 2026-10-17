import type { CityId, DateOnly, TemperatureDay } from '../data/types'

export interface RollingDay {
  date: DateOnly
  value: number | null
}

/**
 * Trailing mean over `window` consecutive available days. A day yields null
 * unless every value in its window is present: gaps stay visible instead of
 * being interpolated away. Values are rounded to 0.1 °C like the dataset.
 */
export function rollingMean(days: readonly TemperatureDay[], city: CityId, window: number): RollingDay[] {
  if (window < 1) return []
  return days.map((day, index) => {
    if (index + 1 < window) return { date: day.date, value: null }
    let sum = 0
    for (let offset = index + 1 - window; offset <= index; offset++) {
      const value = days[offset].temperaturesC[city]
      if (value === null) return { date: day.date, value: null }
      sum += value
    }
    return { date: day.date, value: Math.round((sum / window) * 10) / 10 }
  })
}
