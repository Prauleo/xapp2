import { redirect } from "next/navigation";
import { createClient } from '@supabase/supabase-js';

export default async function Home() {
  // Crear cliente de Supabase para el servidor
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Verificar si el usuario está autenticado
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  
  // Si está autenticado, redirigir al dashboard
  if (session) {
    redirect("/dashboard");
  } else {
    // Si no está autenticado, redirigir a la página de login
    redirect("/login");
  }
}
