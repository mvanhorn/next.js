'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export function PushStatePrefetchRevert() {
  const searchParams = useSearchParams()
  const period = searchParams.get('period') ?? 'none'

  useEffect(() => {
    document.cookie = `period=${period}; path=/`
  }, [period])

  function updatePeriod(period: string, method: 'push' | 'replace') {
    const url = new URL(window.location.href)
    url.searchParams.set('period', period)
    if (method === 'push') {
      window.history.pushState({}, '', url)
    } else {
      window.history.replaceState({}, '', url)
    }
  }

  return (
    <>
      <p id="client-period">client period: {period}</p>
      <Link
        href={`/pushstate-prefetch-revert?period=${period}&from=prefetch`}
        id="prefetched-period"
      >
        Prefetched current period
      </Link>
      <button id="push-period" onClick={() => updatePeriod('90d', 'push')}>
        Push period
      </button>
      <button
        id="replace-period"
        onClick={() => updatePeriod('30d', 'replace')}
      >
        Replace period
      </button>
    </>
  )
}
