import { useEffect } from 'react'

export function usePageTitle(pageTitle: string) {
  useEffect(() => {
    document.title = `${pageTitle} · Scientific Time-Series Explorer`
  }, [pageTitle])
}
