import type { DateErrors, DateRange } from '../data/types'

export const DATA_RANGE: Readonly<DateRange> = { start: '2025-01-01', end: '2025-12-31' }
export const DAY_MS = 86_400_000

export function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export function dateTimestamp(value: string): number {
  return Date.parse(`${value}T00:00:00Z`)
}

const fullDate = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
})
const shortDate = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric', month: 'short', timeZone: 'UTC',
})

export function formatDate(value: string): string {
  return fullDate.format(dateTimestamp(value))
}

export function formatTick(timestamp: number): string {
  return shortDate.format(timestamp)
}

export function validateDateRange(range: DateRange): DateErrors {
  const errors: DateErrors = {}
  for (const field of ['start', 'end'] as const) {
    const value = range[field]
    if (!value) errors[field] = field === 'start' ? 'Choose a start date.' : 'Choose an end date.'
    else if (!isValidDate(value)) errors[field] = 'Enter a valid calendar date.'
    else if (value < DATA_RANGE.start || value > DATA_RANGE.end) {
      errors[field] = 'Choose a date from 1 Jan to 31 Dec 2025.'
    }
  }
  if (!errors.start && !errors.end && range.start > range.end) {
    errors.end = 'End date must be on or after the start date.'
  }
  return errors
}

export function rangesEqual(a: DateRange, b: DateRange): boolean {
  return a.start === b.start && a.end === b.end
}
