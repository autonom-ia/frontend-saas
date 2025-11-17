import { defaultTheme, Theme } from './default';
import { hub2youTheme } from './hub2you';

// Mapeamento de subdomínios para temas
const themeMap: Record<string, Theme> = {
  'hub2you': hub2youTheme,
  'default': defaultTheme,
};

/**
 * Obtém o tema baseado no subdomínio
 * @param subdomain - Subdomínio extraído da URL
 * @returns Theme object correspondente
 */
export function getThemeBySubdomain(subdomain: string | null): Theme {
  if (!subdomain) {
    return defaultTheme;
  }

  const theme = themeMap[subdomain.toLowerCase()];
  return theme || defaultTheme;
}

/**
 * Extrai o subdomínio da URL atual
 * Exemplos:
 * - hub2you.autonomia.site → 'hub2you'
 * - autonomia.site → null
 * - localhost → null
 * @returns Subdomínio ou null
 */
export function getSubdomain(): string | null {
  // 🧪 TESTE LOCAL: Forçar tema específico
  // ⚠️ Descomentar a linha abaixo para forçar tema Hub2You
  // return 'hub2you';
  
  if (typeof window === 'undefined') {
    return null;
  }

  const hostname = window.location.hostname;
  
  // Localhost ou IP
  if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return null;
  }

  const parts = hostname.split('.');
  
  // Se tiver mais de 2 partes, o primeiro é o subdomínio
  // Ex: hub2you.autonomia.site → ['hub2you', 'autonomia', 'site']
  if (parts.length > 2) {
    return parts[0];
  }

  // Apenas domínio principal (autonomia.site)
  return null;
}

export { defaultTheme, hub2youTheme };
export type { Theme };
