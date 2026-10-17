import { Download } from 'lucide-react'
import type { CityPair, DateRange, TemperatureDay } from '../data/types'
import { toCsv } from '../lib/csv'
import { Button } from './ui/button'

export function CsvExportButton({ days, pair, range }: { days: readonly TemperatureDay[]; pair: CityPair; range: DateRange }) {
  function download() {
    // The BOM lets Excel open the Turkish characters as UTF-8.
    const blob = new Blob([`\uFEFF${toCsv(days, pair)}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `temperatures-${pair[0]}-${pair[1]}-${range.start}-to-${range.end}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Button variant="outline" size="sm" type="button" onClick={download} data-testid="csv-export">
      <Download aria-hidden="true" data-icon="inline-start" />
      Download CSV ({days.length} {days.length === 1 ? 'day' : 'days'})
    </Button>
  )
}
