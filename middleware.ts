// middleware.ts
import { withAuth } from "next-auth/middleware"
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Сначала проверяем, есть ли вообще токен
    if (!token) {
        // Если токена нет, а пользователь пытается зайти на защищенную страницу,
        // NextAuth автоматически перенаправит его на страницу входа.
        return NextResponse.next();
    }
    
    const isProfileSetupComplete = token.isProfileSetupComplete;

    // Сценарий 1: Пользователь залогинен, но не завершил настройку профиля.
    if (!isProfileSetupComplete && pathname !== '/setup-profile') {
        // Принудительно перенаправляем его на страницу настройки.
        return NextResponse.redirect(new URL('/setup-profile', req.url));
    }
    
    // Сценарий 2: Пользователь уже настроил профиль, но пытается снова зайти на страницу настройки.
    if (isProfileSetupComplete && pathname === '/setup-profile') {
         // Отправляем его в главный дашборд.
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Во всех остальных случаях разрешаем переход.
    return NextResponse.next();
  },
  {
    callbacks: {
      // Middleware будет работать, только если токен существует (пользователь залогинен).
      authorized: ({ token }) => !!token 
    }
  }
)

// Указываем, для каких страниц будет работать наш "диспетчер".
export const config = {
  matcher: ['/dashboard/:path*', '/profile', '/staff', '/view-profile/:path*', '/setup-profile'],
}
