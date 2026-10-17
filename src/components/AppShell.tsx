import { useEffect } from 'react'
import { FlaskConical } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { ThemeToggle } from './ThemeToggle'

const NAV_ITEMS = [
  { to: '/', label: 'Compare', },
  { to: '/analytics', label: 'Analytics' },
  { to: '/cities', label: 'Cities' },
  { to: '/about', label: 'About' },
] as const

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <>
      <a href="#explorer" className="skip-link">Skip to main content</a>
      <div className="page-shell">
        <header className="page-header">
          <div className="header-row">
            <p className="course-label">SEDS 513 <span>Principles of Human–Computer Interaction</span></p>
            <ThemeToggle />
          </div>
          <h1>Scientific Time-Series Explorer</h1>
          <p className="page-intro">Choose two cities. Set a date range. Explore the patterns.</p>
          <nav aria-label="Pages">
            <ul className="page-nav">
              {NAV_ITEMS.map(({ to, label }) => (
                <li key={to}>
                  <NavLink to={to} end={to === '/'} className={({ isActive }) => `nav-link${isActive ? ' current' : ''}`}>
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <aside className="synthetic-notice" aria-labelledby="dataset-notice-title">
          <FlaskConical size={21} aria-hidden="true" className="notice-icon" />
          <div><h2 id="dataset-notice-title">Synthetic teaching data</h2><p>Simulated daily means for 2025. These values are not meteorological observations.</p></div>
        </aside>

        {children}

        <footer className="page-footer"><span>İzmir Institute of Technology</span><span>SEDS 513 · HCI teaching prototype</span></footer>
      </div>
    </>
  )
}
