import { CITIES, CITY_IDS } from '../../data/cities'
import type { TemperatureDay } from '../../data/types'
import { correlationMatrix } from '../../lib/correlation'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'

export function CorrelationMatrix({ days }: { days: readonly TemperatureDay[] }) {
  const matrix = correlationMatrix(days, CITY_IDS)
  return (
    <div className="correlation-wrap" data-testid="correlation-matrix">
      <Table>
        <TableCaption>
          Pearson correlation of daily mean temperatures between each pair of cities. Values near 1 move together; the
          shared seasonal cycle of the simulation drives the high values.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead scope="col"><span className="sr-only">City</span></TableHead>
            {CITY_IDS.map((city) => (
              <TableHead key={city} scope="col" aria-label={CITIES[city].name}>
                <span aria-hidden="true">{CITIES[city].name.slice(0, 3)}</span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {CITY_IDS.map((rowCity, rowIndex) => (
            <TableRow key={rowCity}>
              <TableHead scope="row" style={{ color: CITIES[rowCity].color }}>{CITIES[rowCity].name}</TableHead>
              {CITY_IDS.map((columnCity, columnIndex) => {
                const value = matrix[rowIndex][columnIndex]
                return (
                  <TableCell
                    key={columnCity}
                    className="correlation-cell tabular-nums"
                    data-cities={`${rowCity}-${columnCity}`}
                    style={value === null ? undefined : { background: `color-mix(in oklab, var(--primary) ${Math.round(value * 26)}%, var(--background))` }}
                  >
                    {value === null ? '—' : value.toFixed(2)}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
