import type { CityId, TemperatureDay } from '../data/types'
import { mean, minMax } from './stats'

export const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const

export interface MonthlyStat {
  month: number // 1–12
  label: string
  count: number
  mean: number | null
  min: number | null
  max: number | null
}

/**
 * One row per calendar month, always twelve. Months come from the UTC date
 * string itself, never from local Date parsing, so grouping cannot shift with
 * the viewer's timezone. Months without any value keep null statistics.
 */
export function monthlyStats(days: readonly TemperatureDay[], city: CityId): MonthlyStat[] {
  const groups = new Map<number, number[]>()
  for (const day of days) {
    const value = day.temperaturesC[city]
    if (value === null) continue
    const month = Number(day.date.slice(5, 7))
    const values = groups.get(month) ?? []
    values.push(value)
    groups.set(month, values)
  }
  return MONTH_LABELS.map((label, index) => {
    const values = groups.get(index + 1) ?? []
    const range = minMax(values)
    const average = mean(values)
    return {
      month: index + 1,
      label,
      count: values.length,
      mean: average === null ? null : Math.round(average * 10) / 10,
      min: range?.[0] ?? null,
      max: range?.[1] ?? null,
    }
  })
}
