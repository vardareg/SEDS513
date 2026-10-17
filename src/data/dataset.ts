import bundled from './temperatures-2025.json'
import type { TemperatureDay } from './types'
import { temperatureDomain } from '../lib/comparison'

export const TEMPERATURE_DAYS: readonly TemperatureDay[] = bundled.days
export const DATASET_METADATA = bundled.metadata
// Calculate once from all cities and all dates, never from the filtered comparison.
export const TEMPERATURE_DOMAIN = temperatureDomain(TEMPERATURE_DAYS)
