import { Suspense } from 'react'
import { PushStatePrefetchRevert } from './client'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const period = (await searchParams).period ?? 'none'

  return (
    <>
      <p id="server-period">server period: {period}</p>
      <Suspense>
        <PushStatePrefetchRevert />
      </Suspense>
    </>
  )
}
