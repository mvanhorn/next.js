import { NextResponse, type NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname !== '/pushstate-prefetch-revert') {
    return NextResponse.next()
  }

  if (request.nextUrl.searchParams.has('period')) {
    const response = NextResponse.next()
    if (request.nextUrl.searchParams.has('from')) {
      response.cookies.set('prefetched-period', '1')
    }
    return response
  }

  const period = request.cookies.get('period')?.value
  if (!period) {
    return NextResponse.next()
  }

  const redirectUrl = request.nextUrl.clone()
  redirectUrl.searchParams.set('period', period)
  return NextResponse.redirect(redirectUrl)
}
