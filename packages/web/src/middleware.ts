import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

const publicRoutes = ['/', '/login', '/auth/callback', '/api/health'];

function isPublicRoute(pathname: string): boolean {
  if (publicRoutes.includes(pathname)) return true;
  if (pathname.startsWith('/profile/dna/')) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // First, refresh the session
  const response = await updateSession(request);

  // Create a supabase client to check auth state
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

  // Authenticated user trying to access /login → redirect to home
  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Unauthenticated user on protected route → redirect to /login
  if (!user && !isPublicRoute(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
