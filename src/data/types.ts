export type CityId = 'izmir' | 'ankara' | 'istanbul'
export type DateOnly = string // Validated YYYY-MM-DD, independent of local timezone.
export type CitySelection = readonly [CityId | null, CityId | null]
export type CityPair = readonly [CityId, CityId]

export interface DateRange {
  start: DateOnly
  end: DateOnly
}

export interface TemperatureDay {
  date: DateOnly
  temperaturesC: Record<CityId, number | null>
}

export interface ChartDay extends TemperatureDay {
  timestamp: number
}

export type DateErrors = Partial<Record<keyof DateRange, string>>
