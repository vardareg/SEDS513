import { CityCard } from '../components/cities/CityCard'
import { CITY_IDS } from '../data/cities'
import { usePageTitle } from '../lib/usePageTitle'

export default function CitiesPage() {
  usePageTitle('Cities')
  return (
    <main id="explorer" tabIndex={-1}>
      <section className="page-section" aria-labelledby="cities-heading">
        <h2 id="cities-heading">City profiles</h2>
        <p className="section-intro">
          All six cities share one synthetic year. The model inputs are teaching choices, not climate facts; the
          sparkline traces each city's monthly means from January to December.
        </p>
        <ul className="city-list">
          {CITY_IDS.map((city) => (
            <CityCard key={city} city={city} />
          ))}
        </ul>
      </section>
    </main>
  )
}
