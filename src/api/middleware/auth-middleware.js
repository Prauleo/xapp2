// middleware/auth-middleware.js
import { NextResponse } from 'next/server';
import supabase from '../services/supabase';

export async function authMiddleware(req) {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    
    return NextResponse.next();
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export default authMiddleware;
