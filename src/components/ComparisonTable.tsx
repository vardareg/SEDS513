import { CITIES } from '../data/cities'
import type { CityPair, DateRange, TemperatureDay } from '../data/types'
import { formatDate } from '../lib/dates'
import { formatTemperature } from '../lib/comparison'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table'

export function ComparisonTable({ days, pair, range }: { days: readonly TemperatureDay[]; pair: CityPair; range: DateRange }) {
  return (
    <details className="daily-values">
      <summary>View daily values <span className="summary-count">({days.length} {days.length === 1 ? 'day' : 'days'})</span></summary>
      <div className="table-region" role="region" aria-label="Daily temperature values" tabIndex={0}>
        <Table>
          <TableCaption>
            Simulated daily means in °C. {CITIES[pair[0]].name} and {CITIES[pair[1]].name}, {formatDate(range.start)} to {formatDate(range.end)}. Missing values are marked Unavailable.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Date</TableHead>
              {pair.map((city) => <TableHead key={city} scope="col" className="text-right">{CITIES[city].name} (°C)</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {days.map((day) => (
              <TableRow key={day.date}>
                <TableHead scope="row"><time dateTime={day.date}>{formatDate(day.date)}</time></TableHead>
                {pair.map((city) => (
                  <TableCell key={city} className="text-right tabular-nums">
                    {formatTemperature(day.temperaturesC[city]).replace(' °C', '')}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </details>
  )
}
