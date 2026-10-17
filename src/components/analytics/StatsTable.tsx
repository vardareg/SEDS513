import { CITIES, CITY_IDS } from '../../data/cities'
import type { TemperatureDay } from '../../data/types'
import { summarizeCity } from '../../lib/stats'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'

function degrees(value: number | null): string {
  return value === null ? '—' : value.toFixed(1)
}

export function StatsTable({ days }: { days: readonly TemperatureDay[] }) {
  return (
    <div className="table-region stats-region" role="region" aria-label="Annual statistics per city" tabIndex={0}>
      <Table>
        <TableCaption>
          Simulated daily means in °C for {days.length} days of 2025. Statistics exclude missing days; the Days column
          counts available values and Missing counts documented gaps.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">City</TableHead>
            <TableHead scope="col" className="text-right">Mean</TableHead>
            <TableHead scope="col" className="text-right">Median</TableHead>
            <TableHead scope="col" className="text-right">Std dev</TableHead>
            <TableHead scope="col" className="text-right">Min</TableHead>
            <TableHead scope="col" className="text-right">Max</TableHead>
            <TableHead scope="col" className="text-right">Days</TableHead>
            <TableHead scope="col" className="text-right">Missing</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {CITY_IDS.map((city) => {
            const summary = summarizeCity(days, city)
            return (
              <TableRow key={city}>
                <TableHead scope="row">
                  <span className="series-item" style={{ color: CITIES[city].color }}>
                    <svg width="22" height="10" aria-hidden="true"><line x1="0" y1="5" x2="22" y2="5" stroke="currentColor" strokeWidth="2.5" strokeDasharray={CITIES[city].dash} /></svg>
                    {CITIES[city].name}
                  </span>
                </TableHead>
                <TableCell className="text-right tabular-nums" data-city={city} data-stat="mean">{degrees(summary.mean)}</TableCell>
                <TableCell className="text-right tabular-nums">{degrees(summary.median)}</TableCell>
                <TableCell className="text-right tabular-nums">{degrees(summary.stdDev)}</TableCell>
                <TableCell className="text-right tabular-nums">{degrees(summary.min)}</TableCell>
                <TableCell className="text-right tabular-nums">{degrees(summary.max)}</TableCell>
                <TableCell className="text-right tabular-nums">{summary.count}</TableCell>
                <TableCell className="text-right tabular-nums">{summary.missing}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
