import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname
    const isPublicPath = path==='/login' || path ==='/signup' || path === '/forgotpassword'
    const token = request.cookies.get('token')?.value || ''
    if(path ==='/verifyemail'){
      return
    }
    if(path ==='/resetpassword'){
      return
    }
    if(path ==='/test'){
      return
    }
    if(path ==='/prompt'){
      return
    }
    if(path == 'game/chess/history/game')
      return NextResponse.redirect(new URL('/login', request.nextUrl))
    if(isPublicPath && token){
    return NextResponse.redirect(new URL('/', request.nextUrl))
    }
    if((!isPublicPath && !token)){
        return NextResponse.redirect(new URL('/login', request.nextUrl))
    }
}
 
export const config = {
  matcher: [
    '/',
    '/login',
    '/signup',
    '/verifyemail',
    '/room',
    '/room/:path*',
    '/test',
    '/forgotpassword',
    '/resetpassword',
    '/test',
    '/otherlogins',
    '/prompt',
  ]
}