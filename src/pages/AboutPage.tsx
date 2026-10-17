import { CITIES, CITY_IDS } from '../data/cities'
import { DATASET_METADATA, TEMPERATURE_DAYS } from '../data/dataset'
import { formatDate } from '../lib/dates'
import { summarizeCity } from '../lib/stats'
import { usePageTitle } from '../lib/usePageTitle'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'

export default function AboutPage() {
  usePageTitle('About')
  const gapCount = CITY_IDS.reduce((sum, city) => sum + DATASET_METADATA.knownGaps[city].length, 0)
  return (
    <main id="explorer" tabIndex={-1}>
      <section className="page-section" aria-labelledby="method-heading">
        <h2 id="method-heading">How the data is made</h2>
        <p className="section-intro">
          Every temperature in this application is synthetic. A deterministic generator, version{' '}
          {DATASET_METADATA.generatorVersion} with seed {DATASET_METADATA.seed}, produced {DATASET_METADATA.year} once;
          the application bundles the result and never invents values while running.
        </p>
        <p className="about-formula" aria-label="Temperature equals baseline plus amplitude times the cosine of two pi times the quantity day minus 200 over 365, plus seeded daily variation.">
          temperature = baseline + amplitude × cos(2π × (day − 200) / 365) + noise
        </p>
        <p className="section-intro">{DATASET_METADATA.method}</p>
        <div className="table-region" role="region" aria-label="Generator parameters per city" tabIndex={0}>
          <Table>
            <TableCaption>Teaching parameters per city. Baselines and amplitudes are model inputs, not fitted climate values.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">City</TableHead>
                <TableHead scope="col" className="text-right">Baseline (°C)</TableHead>
                <TableHead scope="col" className="text-right">Seasonal amplitude (°C)</TableHead>
                <TableHead scope="col" className="text-right">Documented gaps</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CITY_IDS.map((city) => {
                const { baseline, amplitude } = DATASET_METADATA.parameters[city]
                const gaps = DATASET_METADATA.knownGaps[city]
                return (
                  <TableRow key={city}>
                    <TableHead scope="row">{CITIES[city].name}</TableHead>
                    <TableCell className="text-right tabular-nums">{baseline}</TableCell>
                    <TableCell className="text-right tabular-nums">{amplitude}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {gaps.length === 0 ? 'none' : `${gaps.length} (${gaps.map((date) => formatDate(date)).join(', ')})`}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="page-section" aria-labelledby="reproducibility-heading">
        <h2 id="reproducibility-heading">Reproducibility</h2>
        <p className="section-intro">
          The bundled artifact is <code>src/data/temperatures-2025.json</code>: 365 daily records with{' '}
          {CITY_IDS.length * 365} values, of which {gapCount} are documented gaps. Regenerate it with{' '}
          <code>npm run data:generate</code> and verify byte-for-byte parity with <code>npm run data:check</code>. The
          JSON is never hand-edited; generator changes update this page and the design document automatically through
          the shared metadata.
        </p>
      </section>

      <section className="page-section" aria-labelledby="integrity-heading">
        <h2 id="integrity-heading">Data integrity rules</h2>
        <ul className="about-list">
          <li>Dates are <code>YYYY-MM-DD</code> strings handled in UTC, so filtering and charts never shift with the viewer's timezone.</li>
          <li>Date ranges are inclusive at both ends: 31 Jan to 1 Feb contains two days.</li>
          <li>Missing values stay <code>null</code> — displayed as “Unavailable”, breaking chart lines, excluded from statistics, never replaced by zero.</li>
          <li>The comparison chart's temperature scale is computed once from the full dataset and shared by every selection.</li>
        </ul>
      </section>

      <section className="page-section" aria-labelledby="accessibility-heading">
        <h2 id="accessibility-heading">Accessibility and boundaries</h2>
        <p className="section-intro">
          The interface targets WCAG 2.1 AA: keyboard routes through every control, charts offer arrow-key inspection and
          semantic table equivalents, status changes are announced, and automated axe scans run in the browser test
          suite. Automated checks do not replace testing with real people.
        </p>
        <p className="section-intro">
          Out of scope by design: maps, forecasts, real observations, and any external data service. Annual statistics
          across the full dataset are available on the Analytics page; the warmest and coldest cities by annual mean
          are {(() => {
            const ranked = CITY_IDS.map((city) => ({ city, mean: summarizeCity(TEMPERATURE_DAYS, city).mean ?? 0 }))
              .sort((a, b) => b.mean - a.mean)
            return `${CITIES[ranked[0].city].name} and ${CITIES[ranked.at(-1)!.city].name}`
          })()}.
        </p>
      </section>
    </main>
  )
}
