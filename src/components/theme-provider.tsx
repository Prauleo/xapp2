"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  attribute?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
  attribute = "data-theme",
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const root = window.document.documentElement;
    const storedTheme = localStorage.getItem(storageKey) as Theme | null;

    if (storedTheme) {
      setTheme(storedTheme);
      root.setAttribute(attribute, storedTheme);
    } else if (enableSystem) {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      setTheme(systemTheme);
      root.setAttribute(attribute, systemTheme);
    } else {
      root.setAttribute(attribute, defaultTheme);
    }
  }, [attribute, defaultTheme, enableSystem, storageKey]);

  useEffect(() => {
    if (!isMounted) return;

    const root = window.document.documentElement;

    if (disableTransitionOnChange) {
      root.classList.add("no-transitions");
      const timeout = setTimeout(() => {
        root.classList.remove("no-transitions");
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [disableTransitionOnChange, theme, isMounted]);

  useEffect(() => {
    if (!isMounted) return;

    const root = window.document.documentElement;

    if (theme === "system" && enableSystem) {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.setAttribute(attribute, systemTheme);
    } else {
      root.setAttribute(attribute, theme);
    }

    localStorage.setItem(storageKey, theme);
  }, [attribute, enableSystem, storageKey, theme, isMounted]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      setTheme(theme);
    },
  };

  // No renderizar nada hasta que el componente esté montado en el cliente
  if (!isMounted) {
    return <>{children}</>;
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
