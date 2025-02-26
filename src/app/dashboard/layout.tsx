"use client";

import { useRouter } from "next/navigation";
import { signOut } from "../../api/services/supabase";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-14 items-center justify-between">
          <div className="font-bold">AI Content Creator</div>
          <div className="flex items-center gap-4">
            {!isLoading && user && (
              <div className="text-sm text-muted-foreground">
                {user.user_metadata?.full_name || user.email}
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
          <div className="h-full py-6 pr-6 lg:py-8">
            <nav className="flex flex-col space-y-2">
              <a
                href="/dashboard"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                Dashboard
              </a>
              <a
                href="/dashboard/accounts"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                Cuentas
              </a>
              <a
                href="/dashboard/content"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                Contenido
              </a>
              <a
                href="/dashboard/settings"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                Configuración
              </a>
            </nav>
          </div>
        </aside>
        <main className="flex w-full flex-col overflow-hidden py-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
