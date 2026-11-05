import { billingReturn } from "@/lib/billing";
import { NextRequest, NextResponse } from "next/server"

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  const isAuthenticated = !!token
  const { pathname } = request.nextUrl
  const premiumRoutes = ['/study-hub', '/subject-test', '/time-attack', '/sudden-death', '/schedule', '/attendance', '/todays-class', '/assigned-quiz', '/results']
  const premiumPage = premiumRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
  const proPage = pathname === "/jamb-past-questions" || pathname.startsWith("/jamb-past-questions/")
  const premiumApi = pathname === '/api/attendance' || pathname.startsWith('/api/attendance/')
  if (isAuthenticated && (premiumPage || premiumApi || proPage)) {
    try {
      const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5004/api'}/quiztaker/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }, cache: 'no-store',
      })
      if (!response.ok) throw new Error('Unable to verify membership')
      const data = await response.json()
      if (proPage && data.quizTaker?.subscription?.hasProAccess !== true) {
        return NextResponse.redirect(new URL('/dashboard?pro=required', request.url))
      }
      if (data.quizTaker?.accountType !== 'premium') {
        if (premiumApi) return NextResponse.json({ error: 'Subscribe to the premium class to access this feature' }, { status: 403 })
        return NextResponse.redirect(new URL('/dashboard?premium=required', request.url))
      }
    } catch {
      if (premiumApi) return NextResponse.json({ error: 'Unable to verify membership' }, { status: 503 })
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }
  
  // Define public routes
  const publicRoutes = ['/', '/login', '/register', '/about-us', '/pricing', '/support', '/testimonials', '/jamb-results', '/free-mock', '/topic-test', '/utme-preparation-guide', '/privacy-policy', '/terms-of-use', '/robots.txt', '/sitemap.xml']
  const isPublicRoute = publicRoutes.includes(pathname)
  
  // Redirect to login if not authenticated and trying to access protected route
  if (!isAuthenticated && !isPublicRoute) {
    if (pathname === '/billing' || pathname === '/billing/callback') {
      const login = new URL('/login', request.url)
      login.searchParams.set('next', pathname + request.nextUrl.search)
      return NextResponse.redirect(login)
    }
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  // Redirect to home if authenticated and trying to access auth pages
  if (isAuthenticated && ['/login', '/register'].includes(pathname)) {
    return NextResponse.redirect(new URL(billingReturn(request.nextUrl.searchParams.get('next')) || '/dashboard', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpe?g|gif|svg|webp|ico|css|js|woff2?|ttf|eot)).*)',
    '/api/attendance/:path*'
  ]
}
