import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

const publicRoutes = ['/login', '/auth/callback', '/unauthorized'];

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.includes(pathname);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const response = await updateSession(request);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Authenticated user on /login → redirect to dashboard
  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Unauthenticated user on protected route → redirect to /login
  if (!user && !isPublicRoute(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Authenticated but check admin role for protected routes
  if (user && !isPublicRoute(pathname)) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
