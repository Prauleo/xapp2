import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  // Obtener los parámetros de la URL
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  // Crear cliente de Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  if (code) {
    // Intercambiar el código por una sesión
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Redireccionar al dashboard o a la página especificada en 'next'
      return NextResponse.redirect(`${origin}${next}`);
    } else {
      console.error('Error al intercambiar código por sesión:', error);
    }
  }

  // Si hay un error, redirigir a la página de login
  return NextResponse.redirect(`${origin}/login?error=auth-error`);
}
