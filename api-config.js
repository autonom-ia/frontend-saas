// Configuração das APIs para o frontend
const API_CONFIG = {
  development: {
    // API de Autenticação
    AUTH_BASE_URL: 'http://localhost:3003',
    
    // API SaaS
    SAAS_BASE_URL: 'http://localhost:3001',
    
    // Headers para desenvolvimento
    DEV_HEADERS: {
      'Content-Type': 'application/json',
      'Origin': 'http://localhost:3000',
      'X-Dev-Email': 'adfelipevs@gmail.com'
    },
    
    // Endpoints de autenticação
    AUTH_ENDPOINTS: {
      LOGIN: '/login',
      REGISTER: '/register',
      CONFIRM: '/confirm',
      FORGOT_PASSWORD: '/forgot-password',
      RESET_PASSWORD: '/reset-password'
    },
    
    // Endpoints SaaS
    SAAS_ENDPOINTS: {
      PRODUCTS: '/Autonomia/Saas/Products',
      ACCOUNTS: '/Autonomia/Saas/Accounts',
      CAMPAIGNS: '/Autonomia/Saas/Campaigns',
      CONTACTS: '/Autonomia/Saas/Contacts',
      TEMPLATE_MESSAGES: '/Autonomia/Saas/TemplateMessages'
    }
  },
  
  production: {
    AUTH_BASE_URL: 'https://api-auth.autonomia.site',
    SAAS_BASE_URL: 'https://api-saas.autonomia.site'
  }
};

// Função para obter a configuração atual
export const getApiConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return API_CONFIG[env];
};

// URLs completas para facilitar o uso
export const getAuthUrl = (endpoint) => {
  const config = getApiConfig();
  return `${config.AUTH_BASE_URL}${config.AUTH_ENDPOINTS[endpoint]}`;
};

export const getSaasUrl = (endpoint) => {
  const config = getApiConfig();
  return `${config.SAAS_BASE_URL}${config.SAAS_ENDPOINTS[endpoint]}`;
};

// Exemplo de uso:
// const loginUrl = getAuthUrl('LOGIN'); // http://localhost:3003/login
// const productsUrl = getSaasUrl('PRODUCTS'); // http://localhost:3001/Autonomia/Saas/Products
// const campaignsUrl = getSaasUrl('CAMPAIGNS'); // http://localhost:3001/Autonomia/Saas/Campaigns
// const templatesUrl = getSaasUrl('TEMPLATE_MESSAGES'); // http://localhost:3001/Autonomia/Saas/TemplateMessages

export default API_CONFIG;
