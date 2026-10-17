import type { CityId, TemperatureDay } from './types.ts'

// Teaching parameters, not fitted to observations or intended as climate estimates.
const PARAMETERS: Record<CityId, { baseline: number; amplitude: number }> = {
  izmir: { baseline: 18, amplitude: 10 },
  ankara: { baseline: 11, amplitude: 13 },
  istanbul: { baseline: 15, amplitude: 9 },
}

export const DATASET_METADATA = {
  year: 2025,
  seed: 5132025,
  generatorVersion: '1.0.0',
  measurement: 'Simulated daily mean temperature',
  unit: '°C',
  method: 'Annual cosine cycle peaking around day 200, plus seeded independent daily variation bounded by ±2 °C; rounded to 0.1 °C.',
  parameters: PARAMETERS,
} as const

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
  const days: TemperatureDay[] = []
  for (let day = 0; day < 365; day++) {
    const temperaturesC = {} as Record<CityId, number>
    for (const city of ['izmir', 'ankara', 'istanbul'] as const) {
      const { baseline, amplitude } = PARAMETERS[city]
      const seasonal = amplitude * Math.cos((2 * Math.PI * (day - 200)) / 365)
      const rounded = Math.round((baseline + seasonal + (random() * 4 - 2)) * 10) / 10
      // JSON normalizes -0 to 0; keep generator output identical before serialization.
      temperaturesC[city] = rounded === 0 ? 0 : rounded
    }
    days.push({
      date: new Date(Date.UTC(2025, 0, day + 1)).toISOString().slice(0, 10),
      temperaturesC,
    })
  }
  return { metadata: { ...DATASET_METADATA, seed }, days }
}
