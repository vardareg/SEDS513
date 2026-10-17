import { Link } from 'react-router-dom'
import { usePageTitle } from '../lib/usePageTitle'

export default function NotFoundPage() {
  usePageTitle('Page not found')
  return (
    <main id="explorer" tabIndex={-1}>
      <div className="empty-guidance" role="status">
        <span className="empty-marker" aria-hidden="true">404</span>
        <h2>This page does not exist</h2>
        <p>The address may be mistyped, or the page may have moved.</p>
        <p className="empty-note"><Link to="/">Return to the comparison workspace</Link></p>
      </div>
    </main>
  )
}
