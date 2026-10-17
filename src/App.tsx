import { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { CompareProvider } from './lib/compare-state'
import { ThemeProvider } from './lib/theme'

const ComparePage = lazy(() => import('./pages/ComparePage'))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))
const CitiesPage = lazy(() => import('./pages/CitiesPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <CompareProvider>
          <AppShell>
            <Suspense fallback={<p role="status" className="page-status">Loading page…</p>}>
              <Routes>
                <Route path="/" element={<ComparePage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/cities" element={<CitiesPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </AppShell>
        </CompareProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
