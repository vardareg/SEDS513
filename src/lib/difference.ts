import type { CityPair, DateOnly, TemperatureDay } from '../data/types'

export interface DifferenceDay {
  date: DateOnly
  difference: number | null
}

/** Daily first − second for a pair, rounded to 0.1 °C; null on any missing side. */
export function dailyDifference(days: readonly TemperatureDay[], pair: CityPair): DifferenceDay[] {
  return days.map((day) => {
    const first = day.temperaturesC[pair[0]]
    const second = day.temperaturesC[pair[1]]
    return {
      date: day.date,
      difference: first !== null && second !== null ? Math.round((first - second) * 10) / 10 : null,
    }
  })
}

/** Symmetric domain around zero covering every difference, rounded outward to 5. */
export function differenceDomain(days: readonly DifferenceDay[]): [number, number] {
  let max = 0
  for (const day of days) {
    if (day.difference !== null) max = Math.max(max, Math.abs(day.difference))
  }
  const bound = Math.max(5, Math.ceil(max / 5) * 5)
  return [-bound, bound]
}
