/**
 * Configuração centralizada das APIs
 * Usa variáveis de ambiente para alternar entre desenvolvimento e produção
 */

export const API_CONFIG = {
  // URLs das APIs
  AUTH_API_URL: process.env.NEXT_PUBLIC_AUTH_API_URL || 'https://api-auth.autonomia.site',
  SAAS_API_URL: process.env.NEXT_PUBLIC_SAAS_API_URL || 'https://api-saas.autonomia.site',
  LEADSHOT_API_URL: process.env.NEXT_PUBLIC_LEADSHOT_API_URL || 'https://api-leadshot.autonomia.site',
  CLIENTS_API_URL: process.env.NEXT_PUBLIC_CLIENTS_API_URL || 'https://api-clients.autonomia.site',
  
  // Configurações de ambiente
  ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT || 'production',
  DEV_EMAIL: process.env.NEXT_PUBLIC_DEV_EMAIL || '',
  
  // Configurações gerais
  CORS_ORIGIN: process.env.NEXT_PUBLIC_CORS_ORIGIN || 'https://app.autonomia.site',
  REQUEST_TIMEOUT: parseInt(process.env.NEXT_PUBLIC_REQUEST_TIMEOUT || '30000'),
  MAX_FILE_SIZE: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760'),
};

/**
 * Função para criar headers dinâmicos baseados no ambiente
 */
export const createApiHeaders = (authToken?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Adicionar header de desenvolvimento se estiver em ambiente local
  if (API_CONFIG.DEV_EMAIL) {
    headers['X-Dev-Email'] = API_CONFIG.DEV_EMAIL;
  }
  
  // Adicionar token se disponível
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return headers;
};

/**
 * Função para fazer requisições com configuração padrão
 */
export const apiRequest = async (
  url: string, 
  options: RequestInit = {}, 
  authToken?: string
): Promise<Response> => {
  const defaultOptions: RequestInit = {
    headers: createApiHeaders(authToken),
    mode: 'cors',
    ...options,
  };
  
  return fetch(url, defaultOptions);
};

/**
 * URLs dos endpoints principais
 */
export const ENDPOINTS = {
  // Auth
  LOGIN: `${API_CONFIG.AUTH_API_URL}/login`,
  REGISTER: `${API_CONFIG.AUTH_API_URL}/register`,
  
  // SaaS
  PRODUCTS: `${API_CONFIG.SAAS_API_URL}/Autonomia/Saas/Products`,
  ACCOUNTS: `${API_CONFIG.SAAS_API_URL}/Autonomia/Saas/Accounts`,
  CAMPAIGNS: `${API_CONFIG.SAAS_API_URL}/Autonomia/Saas/Campaigns`,
  TEMPLATE_MESSAGES: `${API_CONFIG.SAAS_API_URL}/Autonomia/Saas/TemplateMessages`,
  
  // Leadshot (compatibilidade)
  LEADSHOT_CAMPAIGNS: `${API_CONFIG.LEADSHOT_API_URL}/Autonomia/Leadshot/Campaigns`,
  LEADSHOT_TEMPLATES: `${API_CONFIG.LEADSHOT_API_URL}/Autonomia/Leadshot/TemplateMessages`,
  
  // Clients
  LOGGED_USERS: `${API_CONFIG.CLIENTS_API_URL}/Autonomia/Clients/LoggedUsers`,
};

/**
 * Função para determinar qual endpoint usar baseado no ambiente
 */
export const getEndpoint = (type: 'campaigns' | 'templates'): string => {
  const isDev = API_CONFIG.ENVIRONMENT === 'development';
  
  switch (type) {
    case 'campaigns':
      return isDev ? ENDPOINTS.CAMPAIGNS : ENDPOINTS.LEADSHOT_CAMPAIGNS;
    case 'templates':
      return isDev ? ENDPOINTS.TEMPLATE_MESSAGES : ENDPOINTS.LEADSHOT_TEMPLATES;
    default:
      return '';
  }
};

/**
 * Função para determinar qual path usar baseado no ambiente
 */
export const getApiPath = (type: 'campaigns' | 'templates'): string => {
  const isDev = API_CONFIG.ENVIRONMENT === 'development';
  
  switch (type) {
    case 'campaigns':
      return isDev ? '/Autonomia/Saas/Campaigns' : '/Autonomia/Leadshot/Campaigns';
    case 'templates':
      return isDev ? '/Autonomia/Saas/TemplateMessages' : '/Autonomia/Leadshot/TemplateMessages';
    default:
      return '';
  }
};

export default API_CONFIG;
