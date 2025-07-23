import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Protect API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Skip auth check for webhook endpoints
    if (request.nextUrl.pathname.includes('/webhooks/')) {
      return NextResponse.next()
    }

    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 })
    }

    // Validate token
    try {
      const sessionData = JSON.parse(atob(token))
      const isValid = (Date.now() - sessionData.timestamp) < (24 * 60 * 60 * 1000)
      
      if (!isValid || sessionData.username !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 })
      }
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized - Invalid token format' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/testauth']
}


