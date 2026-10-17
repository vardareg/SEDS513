import type { CityId } from './types'

export const CITY_IDS: readonly CityId[] = ['izmir', 'ankara', 'istanbul']

export const CITIES = {
  izmir: { name: 'İzmir', color: 'var(--city-izmir)', dash: undefined, pattern: 'solid' },
  ankara: { name: 'Ankara', color: 'var(--city-ankara)', dash: '7 4', pattern: 'dashed' },
  istanbul: { name: 'İstanbul', color: 'var(--city-istanbul)', dash: '2 4', pattern: 'dotted' },
} as const satisfies Record<CityId, { name: string; color: string; dash: string | undefined; pattern: string }>

export function isCityId(value: string): value is CityId {
  return CITY_IDS.some((city) => city === value)
}
