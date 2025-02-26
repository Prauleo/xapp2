import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // Crear un cliente de Supabase para el middleware
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  // Crear un cliente de Supabase para el middleware usando cookies
  const cookieStore = request.cookies;
  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Obtener la sesión
  const { data: { session } } = await supabase.auth.getSession();

  // Verificar si la ruta es del dashboard
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');

  // Si es una ruta del dashboard y no hay sesión, redirigir al login
  if (isDashboardRoute && !session) {
    const redirectUrl = new URL('/login', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Si es la ruta de login y hay sesión, redirigir al dashboard
  if (request.nextUrl.pathname === '/login' && session) {
    const redirectUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Continuar con la solicitud
  return NextResponse.next();
}

// Configurar las rutas que deben ser manejadas por el middleware
export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
