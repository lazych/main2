import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/session-edge'

// Specify protected and public routes
const protectedRoutes = ['/dashboard']
const publicRoutes = ['/login', '/register', '/']

export default async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname
    const isProtectedRoute = protectedRoutes.includes(path) || path.startsWith('/dashboard')
    const isPublicRoute = publicRoutes.includes(path)

    // Decrypt the session from the cookie
    // Use the request cookies directly for Edge compatibility
    const cookie = req.cookies.get('session')?.value
    const session = cookie ? await decrypt(cookie) : null

    // Redirect to /login if the user is not authenticated
    if (isProtectedRoute && !session?.userId) {
        return NextResponse.redirect(new URL('/login', req.nextUrl))
    }

    // Redirect to /dashboard if the user is authenticated
    if (isPublicRoute && session?.userId && path !== '/dashboard') {
        return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
    }

    return NextResponse.next()
}

// Explicitly set Experimental Edge Runtime
export const runtime = 'experimental-edge'


// Routes Middleware should not run on
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js)$).*)'],
}

