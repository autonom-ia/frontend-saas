import { useEffect, useState } from 'react';
import { getSubdomain, getThemeBySubdomain, Theme } from '@/config/themes';

/**
 * Hook para gerenciar o tema baseado no subdomínio
 * Detecta automaticamente o subdomínio e carrega o tema correspondente
 */
export function useTheme() {
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

    console.log('[Theme] Subdomain:', currentSubdomain);
    console.log('[Theme] Theme loaded:', currentTheme.name);
  }, []);

  return {
    theme,
    subdomain,
    isLoading: theme === null,
  };
}
