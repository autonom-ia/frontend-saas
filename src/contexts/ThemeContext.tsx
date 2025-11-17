"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getSubdomain, getDomainName, getThemeBySubdomain, Theme } from '@/config/themes';

type ThemeContextType = {
  theme: Theme;
  subdomain: string | null;
  isLoading: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [subdomain, setSubdomain] = useState<string | null>(null);

  useEffect(() => {
    // Detectar subdomínio
    const currentSubdomain = getSubdomain();
    setSubdomain(currentSubdomain);

    // Carregar tema correspondente
    const currentTheme = getThemeBySubdomain(currentSubdomain);
    setTheme(currentTheme);

    // Aplicar CSS variables ao root do documento
    if (currentTheme) {
      const root = document.documentElement;
      Object.entries(currentTheme.cssVariables).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }

    const domainName = getDomainName();
    console.log('[ThemeProvider] Subdomain:', currentSubdomain);
    console.log('[ThemeProvider] Domain:', domainName);
    console.log('[ThemeProvider] Theme loaded:', currentTheme.name);
  }, []);

  // Mostrar loading enquanto carrega o tema
  if (!theme) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, subdomain, isLoading: false }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook para acessar o tema atual
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
