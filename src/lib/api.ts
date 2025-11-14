// API Configuration and Services
import { getStoredUser, setStoredUser, refreshTokens } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_LEADSHOT_API_URL || 'https://api-leadshot.autonomia.site';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  contact_data?: Record<string, unknown>;
  campaign_id: string;
  account_id: string;
  external_code?: string;
  external_status?: string;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  template_message_id?: string;
  account_id: string;
  created_at?: string;
  account_name?: string;
  template_name?: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    processed: number;
    duplicates: number;
    errors: number;
    contacts: Contact[];
  };
}

export interface MessageLog {
  id: string;
  phone_number: string;
  success: boolean;
  error?: string;
  campaign_id: string;
  created_at: string;
}

class ApiService {
  /**
   * Decodifica token JWT e retorna o payload
   */
  private decodeToken(token: string): { exp?: number; sub?: string } | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join(''));
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  /**
   * Verifica se o token está expirado ou vai expirar em breve (5 min)
   */
  private isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) return true;
    
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = payload.exp - now;
    
    // Considera expirado se falta menos de 5 minutos
    return expiresIn < 300;
  }

  /**
   * Renova o token se necessário
   */
  private async ensureValidToken(): Promise<void> {
    const userData = getStoredUser();
    if (!userData?.RefreshToken) return;

    const currentToken = userData.IdToken || userData.token || userData.AccessToken;
    if (!currentToken) return;

    // Se o token está válido (não expira em 5 min), não faz nada
    if (!this.isTokenExpired(currentToken)) return;

    console.log('[API] Token expirado ou próximo da expiração, renovando...');
    
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
      const updated = await refreshTokens(apiBase, userData.RefreshToken);
      const merged = {
        ...userData,
        ...updated,
        refreshedAt: Date.now(),
        isAuthenticated: true,
      };
      setStoredUser(merged);
      console.log('[API] Token renovado com sucesso');
    } catch (error) {
      console.error('[API] Erro ao renovar token:', error);
      // Se falhar, limpa autenticação
      setStoredUser({ ...userData, isAuthenticated: false });
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Sessão expirada. Faça login novamente.');
    }
  }

  private getAuthToken(): string | undefined {
    try {
      // Try direct authToken first
      const directToken = localStorage.getItem('authToken');
      if (directToken) return directToken;
      
      // Fallback to userData
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsed = JSON.parse(userData);
        return parsed.IdToken || parsed.token || parsed.AccessToken;
      }
    } catch (e) {
      console.error('Error getting auth token:', e);
    }
    return undefined;
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    // Garante que o token está válido antes de fazer a requisição
    await this.ensureValidToken();
    
    const token = this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  async uploadContacts(campaignId: string, file: File, accountId: string, sendMessages = false): Promise<UploadResponse> {
    // Converter arquivo para base64
    const base64Content = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1] || '';
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const response = await fetch(`${API_BASE_URL}/Autonomia/Leadshot/Campaigns/${campaignId}/contacts/upload`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify({
        file: base64Content,
        filename: file.name,
        accountId,
        sendMessages
      }),
      mode: 'cors',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao fazer upload dos contatos');
    }

    return response.json();
  }

  async getContacts(campaignId: string, page = 1, limit = 50): Promise<{
    contacts: Contact[];
    total: number;
    page: number;
    limit: number;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/Autonomia/Leadshot/Campaigns/${campaignId}/contacts?page=${page}&limit=${limit}`,
      {
        headers: await this.getAuthHeaders(),
        mode: 'cors',
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao buscar contatos');
    }

    return response.json();
  }

  async updateContactStatus(contactId: string, status: string): Promise<Contact> {
    const response = await fetch(`${API_BASE_URL}/Autonomia/Leadshot/contacts/${contactId}/status`, {
      method: 'PUT',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify({ external_status: status }),
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error('Erro ao atualizar status do contato');
    }

    return response.json();
  }

  async sendCampaignMessages(campaignId: string): Promise<{
    success: boolean;
    message: string;
    data: {
      sent: number;
      failed: number;
      total: number;
    };
  }> {
    const response = await fetch(`${API_BASE_URL}/Autonomia/Leadshot/Campaigns/${campaignId}/send`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      mode: 'cors',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao enviar mensagens da campanha');
    }

    return response.json();
  }

  async getMessageLogs(campaignId: string, page = 1, limit = 50): Promise<{
    logs: MessageLog[];
    total: number;
    page: number;
    limit: number;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/Autonomia/Leadshot/Campaigns/${campaignId}/logs?page=${page}&limit=${limit}`,
      {
        headers: await this.getAuthHeaders(),
        mode: 'cors',
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao buscar logs de mensagens');
    }

    return response.json();
  }

  async getCampaigns(productId?: string): Promise<Campaign[]> {
    const url = productId 
      ? `${API_BASE_URL}/Autonomia/Leadshot/Campaigns?productId=${encodeURIComponent(productId)}`
      : `${API_BASE_URL}/Autonomia/Leadshot/Campaigns`;
    
    const response = await fetch(url, {
      headers: await this.getAuthHeaders(),
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar campanhas');
    }

    const data = await response.json();
    console.log('[API] Campanhas recebidas:', data);
    // Try different response formats
    return Array.isArray(data) ? data : (data.data || data.campaigns || []);
  }

  async getProducts(): Promise<Array<{ id: string; name: string; description?: string }>> {
    const SAAS_API_URL = process.env.NEXT_PUBLIC_SAAS_API_URL || 'https://api-saas.autonomia.site';
    const url = `${SAAS_API_URL}/Autonomia/Saas/Products`;
    
    const response = await fetch(url, {
      headers: await this.getAuthHeaders(),
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar produtos');
    }

    const data = await response.json();
    return Array.isArray(data) ? data : (data.data || data.products || []);
  }

  async getAccounts(productId: string): Promise<Array<{ id: string; name: string; email?: string }>> {
    const SAAS_API_URL = process.env.NEXT_PUBLIC_SAAS_API_URL || 'https://api-saas.autonomia.site';
    const url = `${SAAS_API_URL}/Autonomia/Saas/Accounts?productId=${encodeURIComponent(productId)}`;
    
    const response = await fetch(url, {
      headers: await this.getAuthHeaders(),
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar contas');
    }

    const data = await response.json();
    return Array.isArray(data) ? data : (data.data || data.accounts || []);
  }
}

export const apiService = new ApiService();
