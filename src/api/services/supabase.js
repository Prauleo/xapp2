// services/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Crear el cliente de Supabase solo en el lado del cliente
let supabase;

if (typeof window !== 'undefined') {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
} else {
  // En el lado del servidor, crear un cliente básico
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
};

export const signInWithGoogle = async () => {
  if (typeof window === 'undefined') {
    throw new Error('Esta función solo puede ser llamada en el lado del cliente');
  }
  
  try {
    console.log('Iniciando sesión con Google...');
    console.log('URL de redirección:', `${window.location.origin}/auth/callback`);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    
    if (error) {
      console.error('Error al iniciar sesión con Google:', error);
      throw error;
    }
    
    return data;
  } catch (err) {
    console.error('Error al iniciar sesión con Google:', err);
    throw err;
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Funciones para gestionar cuentas de redes sociales
export const createAccount = async (accountData) => {
  const { data, error } = await supabase
    .from('accounts')
    .insert([accountData])
    .select();
  if (error) throw error;
  return data[0];
};

export const getAccounts = async (userId) => {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return data;
};

// Funciones para gestionar contenido
export const saveContent = async (contentData) => {
  const { data, error } = await supabase
    .from('content')
    .insert([contentData])
    .select();
  if (error) throw error;
  return data[0];
};

export const getContent = async (accountId) => {
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .eq('account_id', accountId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

// Funciones para gestionar canvas narrativos
export const saveCanvas = async (canvasData) => {
  const { data, error } = await supabase
    .from('canvas')
    .upsert([canvasData])
    .select();
  if (error) throw error;
  return data[0];
};

export const getCanvas = async (accountId) => {
  const { data, error } = await supabase
    .from('canvas')
    .select('*')
    .eq('account_id', accountId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export default supabase;
