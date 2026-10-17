import type { CityId } from './types'

export const CITY_IDS: readonly CityId[] = ['izmir', 'ankara', 'istanbul', 'antalya', 'erzurum', 'van']

export const CITIES = {
  izmir: { name: 'İzmir', region: 'Aegean', color: 'var(--city-izmir)', dash: undefined, pattern: 'solid' },
  ankara: { name: 'Ankara', region: 'Central Anatolia', color: 'var(--city-ankara)', dash: '7 4', pattern: 'dashed' },
  istanbul: { name: 'İstanbul', region: 'Marmara', color: 'var(--city-istanbul)', dash: '2 4', pattern: 'dotted' },
  antalya: { name: 'Antalya', region: 'Mediterranean', color: 'var(--city-antalya)', dash: '9 3 2 3', pattern: 'dash-dot' },
  erzurum: { name: 'Erzurum', region: 'Eastern Anatolia', color: 'var(--city-erzurum)', dash: '16 4', pattern: 'long-dash' },
  van: { name: 'Van', region: 'Eastern Anatolia', color: 'var(--city-van)', dash: '3 2', pattern: 'short-dash' },
} as const satisfies Record<CityId, { name: string; region: string; color: string; dash: string | undefined; pattern: string }>

export function isCityId(value: string): value is CityId {
  return CITY_IDS.some((city) => city === value)
}
