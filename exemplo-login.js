// Exemplo de como fazer login corretamente
import { getAuthUrl, getApiConfig } from './api-config.js';

// Função para fazer login
export const login = async (email, password) => {
  const config = getApiConfig();
  const loginUrl = getAuthUrl('LOGIN'); // http://localhost:3003/login
  
  try {
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000'
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Salvar tokens no localStorage
    localStorage.setItem('accessToken', data.AccessToken);
    localStorage.setItem('idToken', data.IdToken);
    localStorage.setItem('refreshToken', data.RefreshToken);
    localStorage.setItem('userEmail', data.email);
    
    return {
      success: true,
      data: data
    };
    
  } catch (error) {
    console.error('Erro no login:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Função para fazer requisições à API SaaS (com autenticação)
export const fetchSaasData = async (endpoint, options = {}) => {
  const config = getApiConfig();
  const url = `${config.SAAS_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'X-Dev-Email': 'adfelipevs@gmail.com', // Para desenvolvimento
    'Origin': 'http://localhost:3000'
  };
  
  // Em produção, usar o token JWT
  const token = localStorage.getItem('accessToken');
  if (token && process.env.NODE_ENV === 'production') {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
    
  } catch (error) {
    console.error('Erro na requisição SaaS:', error);
    throw error;
  }
};

// Exemplo de uso no componente React:
/*
import { login, fetchSaasData } from './exemplo-login.js';

// No componente de login
const handleLogin = async (email, password) => {
  const result = await login(email, password);
  
  if (result.success) {
    console.log('Login realizado com sucesso!');
    // Redirecionar para dashboard
  } else {
    console.error('Erro no login:', result.error);
    // Mostrar mensagem de erro
  }
};

// Para buscar produtos
const loadProducts = async () => {
  try {
    const products = await fetchSaasData('/Autonomia/Saas/Products');
    console.log('Produtos:', products);
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
  }
};
*/
