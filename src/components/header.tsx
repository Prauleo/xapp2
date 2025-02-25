"use client";

import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import { Globe } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [language, setLanguage] = useState<"es" | "en">("es");

  const toggleLanguage = () => {
    setLanguage(language === "es" ? "en" : "es");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="inline-block font-bold text-xl">XApp</span>
          </Link>
          <nav className="flex gap-6">
            <Link
              href="/dashboard"
              className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {language === "es" ? "Dashboard" : "Dashboard"}
            </Link>
            <Link
              href="/accounts"
              className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {language === "es" ? "Cuentas" : "Accounts"}
            </Link>
            <Link
              href="/content"
              className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {language === "es" ? "Contenido" : "Content"}
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              title={language === "es" ? "Switch to English" : "Cambiar a Español"}
            >
              <Globe className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">
                {language === "es" ? "Switch to English" : "Cambiar a Español"}
              </span>
            </Button>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
