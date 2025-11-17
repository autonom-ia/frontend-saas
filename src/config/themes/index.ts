import { defaultTheme, Theme } from './default';
import { hub2youTheme } from './hub2you';

// Mapeamento de subdomínios/domínios para temas
// A busca é feita primeiro por subdomínio, depois por nome do domínio principal
// Exemplos:
// - teste.hub2you.autonomia.site → busca 'teste', depois 'hub2you', depois 'autonomia'
// - hub2you.autonomia.site → busca 'hub2you', depois 'autonomia'
// - autonomia.site → busca 'autonomia'
const themeMap: Record<string, Theme> = {
  'hub2you': hub2youTheme,
  'autonomia': defaultTheme, // Tema para domínio principal autonomia.site
  'default': defaultTheme,
};

/**
 * Extrai o nome do domínio principal da URL
 * Exemplos:
 * - hub2you.autonomia.site → 'autonomia'
 * - autonomia.site → 'autonomia'
 * - localhost → null
 * @returns Nome do domínio principal ou null
 */
export function getDomainName(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const hostname = window.location.hostname;
  
  // Localhost ou IP
  if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return null;
  }

  const parts = hostname.split('.');
  
  // Se tiver 2 ou mais partes, pegar a penúltima (nome do domínio)
  // Ex: autonomia.site → 'autonomia'
  // Ex: hub2you.autonomia.site → 'autonomia'
  if (parts.length >= 2) {
    return parts[parts.length - 2];
  }

  return null;
}

/**
 * Obtém o tema baseado no subdomínio ou domínio
 * @param subdomain - Subdomínio extraído da URL
 * @returns Theme object correspondente
 */
export function getThemeBySubdomain(subdomain: string | null): Theme {
  // 1. Tentar buscar tema pelo subdomínio
  if (subdomain) {
    const subdomainTheme = themeMap[subdomain.toLowerCase()];
    if (subdomainTheme) {
      return subdomainTheme;
    }
  }

  // 2. Se não encontrar, tentar buscar tema pelo nome do domínio principal
  const domainName = getDomainName();
  if (domainName) {
    const domainTheme = themeMap[domainName.toLowerCase()];
    if (domainTheme) {
      return domainTheme;
    }
  }

  // 3. Fallback para tema default
  return defaultTheme;
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
