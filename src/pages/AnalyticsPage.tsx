import { Suspense, lazy } from 'react'
import { CalendarHeatmap } from '../components/analytics/CalendarHeatmap'
import { CorrelationMatrix } from '../components/analytics/CorrelationMatrix'
import { DistributionGrid } from '../components/analytics/DistributionGrid'
import { StatsTable } from '../components/analytics/StatsTable'
import { TEMPERATURE_DAYS } from '../data/dataset'
import { usePageTitle } from '../lib/usePageTitle'

const MonthlyMeansChart = lazy(() => import('../components/analytics/MonthlyMeansChart'))

export default function AnalyticsPage() {
  usePageTitle('Analytics')
  return (
    <main id="explorer" tabIndex={-1}>
      <section className="page-section" aria-labelledby="stats-heading">
        <h2 id="stats-heading">Annual statistics</h2>
        <p className="section-intro">Every value from the full synthetic year, per city. Missing days are excluded from the statistics and counted separately.</p>
        <StatsTable days={TEMPERATURE_DAYS} />
      </section>
      <section className="page-section" aria-labelledby="monthly-heading">
        <h2 id="monthly-heading">Monthly means</h2>
        <p className="section-intro">Averaging by calendar month makes the seasonal cycle visible for all six cities at once. Months with gaps average their available days.</p>
        <Suspense fallback={<p role="status" className="empty-guidance">Preparing monthly chart…</p>}>
          <MonthlyMeansChart days={TEMPERATURE_DAYS} />
        </Suspense>
      </section>
      <section className="page-section" aria-labelledby="distribution-heading">
        <h2 id="distribution-heading">Daily distributions</h2>
        <p className="section-intro">How many days fall in each 2 °C band. All six panels share one scale, so widths compare directly; the dashed line marks the annual mean.</p>
        <DistributionGrid days={TEMPERATURE_DAYS} />
      </section>
      <section className="page-section" aria-labelledby="heatmap-heading">
        <h2 id="heatmap-heading">The year at a glance</h2>
        <p className="section-intro">One cell per day, cold to warm. Hatched cells are the documented missing days. Every value is also listed in the table below the grid.</p>
        <CalendarHeatmap days={TEMPERATURE_DAYS} />
      </section>
      <section className="page-section" aria-labelledby="correlation-heading">
        <h2 id="correlation-heading">City correlations</h2>
        <p className="section-intro">How closely daily values move together. The shared seasonal cycle of the simulation produces strong correlations; this is a property of the teaching data, not of real weather.</p>
        <CorrelationMatrix days={TEMPERATURE_DAYS} />
      </section>
    </main>
  )
}
