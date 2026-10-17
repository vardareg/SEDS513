import type { CityId, TemperatureDay } from '../data/types'

/** Pearson r over days where both cities have values; null when undeterminable. */
export function pearson(days: readonly TemperatureDay[], a: CityId, b: CityId): number | null {
  let count = 0
  let sumA = 0
  let sumB = 0
  let sumAA = 0
  let sumBB = 0
  let sumAB = 0
  for (const day of days) {
    const first = day.temperaturesC[a]
    const second = day.temperaturesC[b]
    if (first === null || second === null) continue
    count += 1
    sumA += first
    sumB += second
    sumAA += first * first
    sumBB += second * second
    sumAB += first * second
  }
  if (count < 2) return null
  if (a === b) return 1
  const numerator = sumAB - (sumA * sumB) / count
  const denominator = Math.sqrt((sumAA - (sumA * sumA) / count) * (sumBB - (sumB * sumB) / count))
  if (denominator === 0) return null
  return Math.round((numerator / denominator) * 1000) / 1000
}

/**
 * Square matrix in the same order as `cities`; cells below the diagonal are
 * null. The diagonal is exactly 1 where the city has at least two values.
 */
export function correlationMatrix(days: readonly TemperatureDay[], cities: readonly CityId[]): (number | null)[][] {
  return cities.map((rowCity, rowIndex) =>
    cities.map((columnCity, columnIndex) => (columnIndex < rowIndex ? null : pearson(days, rowCity, columnCity))),
  )
}
