import { describe, expect, it } from 'vitest'
import type { TemperatureDay } from '../data/types'
import { escapeCsvField, toCsv } from './csv'

const fixture: TemperatureDay[] = [
  { date: '2025-01-31', temperaturesC: { izmir: 8.5, ankara: -2, istanbul: 5, antalya: 9.4, erzurum: -4.2, van: 2.1 } },
  { date: '2025-02-01', temperaturesC: { izmir: null, ankara: 0, istanbul: 6, antalya: 10, erzurum: -3.9, van: 1.8 } },
]

describe('CSV export', () => {
  it('writes a header with display names and one row per day', () => {
    const csv = toCsv(fixture, ['izmir', 'ankara'])
    const lines = csv.split('\r\n')
    expect(lines[0]).toBe('Date,İzmir,Ankara')
    expect(lines[1]).toBe('2025-01-31,8.5,-2.0')
    expect(lines.at(-1)).toBe('')
    expect(lines).toHaveLength(4)
  })

  it('keeps missing values as empty fields rather than zero', () => {
    const lines = toCsv(fixture, ['izmir', 'ankara']).split('\r\n')
    expect(lines[2]).toBe('2025-02-01,,0.0')
  })

  it('quotes fields containing commas, quotes, or line breaks', () => {
    expect(escapeCsvField('plain')).toBe('plain')
    expect(escapeCsvField('İzmir, Aegean')).toBe('"İzmir, Aegean"')
    expect(escapeCsvField('say "hi"')).toBe('"say ""hi"""')
  })
})
