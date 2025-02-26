"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "../api/services/supabase";
import { createClient, Session, User, UserMetadata } from "@supabase/supabase-js";

// Crear el cliente de Supabase para el contexto
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    
    // Función para obtener el usuario actual
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const currentUser = await getCurrentUser();
        
        if (currentUser) {
          const authUser: AuthUser = {
            id: currentUser.id,
            email: currentUser.email,
            user_metadata: {
              full_name: currentUser.user_metadata?.full_name,
              avatar_url: currentUser.user_metadata?.avatar_url
            }
          };
          setUser(authUser);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Error al obtener el usuario:", err);
        setError("Error al obtener la información del usuario");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Obtener el usuario al cargar el componente
    fetchUser();

    // Suscribirse a cambios en la autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        if (event === "SIGNED_IN" && session) {
          // Usuario ha iniciado sesión
          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email,
            user_metadata: {
              full_name: session.user.user_metadata?.full_name,
              avatar_url: session.user.user_metadata?.avatar_url
            }
          };
          setUser(authUser);
        } else if (event === "SIGNED_OUT") {
          // Usuario ha cerrado sesión
          setUser(null);
          router.push("/login");
        } else if (event === "USER_UPDATED" && session) {
          // Información del usuario actualizada
          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email,
            user_metadata: {
              full_name: session.user.user_metadata?.full_name,
              avatar_url: session.user.user_metadata?.avatar_url
            }
          };
          setUser(authUser);
        }
      }
    );

    // Limpiar suscripción al desmontar
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  // No renderizar nada hasta que el componente esté montado en el cliente
  if (!isMounted) {
    return <>{children}</>;
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
}
