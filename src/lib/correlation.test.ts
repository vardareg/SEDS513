import { describe, expect, it } from 'vitest'
import type { CityId, TemperatureDay } from '../data/types'
import { CITY_IDS } from '../data/cities'
import bundled from '../data/temperatures-2025.json'
import { correlationMatrix, pearson } from './correlation'

function series(name: string, values: (number | null)[]): TemperatureDay[] {
  return values.map((value, index) => ({
    date: `2025-01-${String(index + 1).padStart(2, '0')}`,
    temperaturesC: { izmir: name === 'izmir' ? value : 0, ankara: name === 'ankara' ? value : 0, istanbul: 0, antalya: 0, erzurum: 0, van: 0 } as Record<CityId, number | null>,
  }))
}

describe('correlation', () => {
  it('returns 1 for identical series and −1 for mirrored series', () => {
    const rising: TemperatureDay[] = [1, 2, 3, 4].map((value, index) => ({
      date: `2025-01-0${index + 1}`,
      temperaturesC: { izmir: value, ankara: value, istanbul: -value, antalya: 0, erzurum: 0, van: 0 },
    }))
    expect(pearson(rising, 'izmir', 'ankara')).toBe(1)
    expect(pearson(rising, 'izmir', 'istanbul')).toBe(-1)
    expect(pearson(rising, 'izmir', 'izmir')).toBe(1)
  })

  it('matches a hand-computed value', () => {
    const days: TemperatureDay[] = [1, 2, 3].map((value, index) => ({
      date: `2025-01-0${index + 1}`,
      temperaturesC: { izmir: value, ankara: [2, 4, 7][index], istanbul: 0, antalya: 0, erzurum: 0, van: 0 },
    }))
    expect(pearson(days, 'izmir', 'ankara')!).toBeCloseTo(0.993, 3)
  })

  it('returns null for constant series, too few pairs, or gapped overlaps', () => {
    expect(pearson(series('izmir', [5, 5, 5]), 'izmir', 'ankara')).toBeNull()
    expect(pearson(series('izmir', [1]), 'izmir', 'ankara')).toBeNull()
    const disjoint: TemperatureDay[] = [
      { date: '2025-01-01', temperaturesC: { izmir: 1, ankara: null, istanbul: 0, antalya: 0, erzurum: 0, van: 0 } },
      { date: '2025-01-02', temperaturesC: { izmir: null, ankara: 2, istanbul: 0, antalya: 0, erzurum: 0, van: 0 } },
    ]
    expect(pearson(disjoint, 'izmir', 'ankara')).toBeNull()
  })

  it('builds an upper-triangular matrix over the bundled dataset', () => {
    const matrix = correlationMatrix(bundled.days, CITY_IDS)
    expect(matrix).toHaveLength(6)
    matrix.forEach((row, rowIndex) => {
      expect(row).toHaveLength(6)
      row.forEach((cell, columnIndex) => {
        if (columnIndex < rowIndex) expect(cell).toBeNull()
        else if (columnIndex === rowIndex) expect(cell).toBe(1)
        else expect(cell!).toBeGreaterThan(0)
      })
    })
  })
})
