import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware (request: NextRequest): any {
  return NextResponse.rewrite(
    new URL(`${process.env.SERVER_SERVICE}${request.nextUrl.pathname.replace(/^\/api/, '')}${request.nextUrl.search}`), { request }
  )
}

export const config = {
  matcher: '/api/:path*'
}
