import { CITIES } from '../data/cities'
import type { CityId, TemperatureDay } from '../data/types'

/** RFC 4180: quote a field only when it contains a comma, quote, or line break. */
export function escapeCsvField(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

/** CSV with CRLF line endings; missing values become empty fields, never 0. */
export function toCsv(days: readonly TemperatureDay[], cities: readonly CityId[]): string {
  const header = ['Date', ...cities.map((city) => CITIES[city].name)].map(escapeCsvField).join(',')
  const rows = days.map((day) =>
    [
      day.date,
      ...cities.map((city) => {
        const value = day.temperaturesC[city]
        return value === null ? '' : value.toFixed(1)
      }),
    ]
      .map(escapeCsvField)
      .join(','),
  )
  return [header, ...rows].join('\r\n') + '\r\n'
}
