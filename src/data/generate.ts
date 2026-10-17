import type { CityId, TemperatureDay } from './types.ts'

// Teaching parameters, not fitted to observations or intended as climate estimates.
const PARAMETERS: Record<CityId, { baseline: number; amplitude: number }> = {
  izmir: { baseline: 18, amplitude: 10 },
  ankara: { baseline: 11, amplitude: 13 },
  istanbul: { baseline: 15, amplitude: 9 },
  antalya: { baseline: 19, amplitude: 10 },
  erzurum: { baseline: 6, amplitude: 14 },
  van: { baseline: 9, amplitude: 13 },
}

// Fixed calendar gaps so missing-value handling stays visible in the interface.
const KNOWN_GAPS: Record<CityId, readonly string[]> = {
  izmir: [],
  ankara: [],
  istanbul: ['2025-11-03', '2025-11-04'],
  antalya: [],
  erzurum: ['2025-01-10', '2025-01-11', '2025-01-12'],
  van: ['2025-07-20', '2025-07-21', '2025-07-22'],
}

export const DATASET_METADATA = {
  year: 2025,
  seed: 5132025,
  generatorVersion: '2.0.0',
  measurement: 'Simulated daily mean temperature',
  unit: '°C',
  method: 'Annual cosine cycle peaking around day 200, plus seeded independent daily variation bounded by ±2 °C; rounded to 0.1 °C. Eight documented gap days are set to null.',
  parameters: PARAMETERS,
  knownGaps: KNOWN_GAPS,
} as const

// Generator 2.x draws the original three cities exactly as 1.x did — their values
// are unchanged — then continues the same seeded stream for the added cities.
const DRAW_GROUPS: readonly (readonly CityId[])[] = [
  ['izmir', 'ankara', 'istanbul'],
  ['antalya', 'erzurum', 'van'],
]

// Mulberry32: small, explicitly seeded, reproducible unsigned 32-bit PRNG.
function seededRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let value = Math.imul(state ^ (state >>> 15), 1 | state)
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

export function generateDataset(seed = DATASET_METADATA.seed as number) {
  const random = seededRandom(seed)
  const days: TemperatureDay[] = Array.from({ length: 365 }, (_, day) => ({
    date: new Date(Date.UTC(2025, 0, day + 1)).toISOString().slice(0, 10),
    temperaturesC: {} as Record<CityId, number | null>,
  }))
  for (const group of DRAW_GROUPS) {
    days.forEach((day, dayIndex) => {
      for (const city of group) {
        const { baseline, amplitude } = PARAMETERS[city]
        const seasonal = amplitude * Math.cos((2 * Math.PI * (dayIndex - 200)) / 365)
        const rounded = Math.round((baseline + seasonal + (random() * 4 - 2)) * 10) / 10
        // JSON normalizes -0 to 0; keep generator output identical before serialization.
        day.temperaturesC[city] = rounded === 0 ? 0 : rounded
      }
    })
  }
  for (const city of Object.keys(KNOWN_GAPS) as CityId[]) {
    for (const date of KNOWN_GAPS[city]) {
      days.find((day) => day.date === date)!.temperaturesC[city] = null
    }
  }
  return { metadata: { ...DATASET_METADATA, seed }, days }
}
