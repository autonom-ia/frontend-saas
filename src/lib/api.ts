// API Configuration and Services
const API_BASE_URL = process.env.NEXT_PUBLIC_SAAS_API_URL || 'https://api-saas.autonomia.site';

const IS_DEV = process.env.NODE_ENV === 'development';

function getDevUserEmail(): string | undefined {
  // Priority: explicit env -> localStorage userData
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_DEV_EMAIL) {
    return process.env.NEXT_PUBLIC_DEV_EMAIL;
  }
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('userData');
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed?.email || parsed?.user?.email;
      }
    } catch (_) { /* ignore */ }
  }
  return undefined;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  contact_data?: Record<string, any>;
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
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (IS_DEV) {
      const devEmail = getDevUserEmail();
      if (devEmail) headers['X-User-Email'] = devEmail;
    }
    return headers;
  }

  private getAuthHeadersForFormData(): HeadersInit {
    const token = localStorage.getItem('authToken');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (IS_DEV) {
      const devEmail = getDevUserEmail();
      if (devEmail) headers['X-User-Email'] = devEmail;
    }
    return headers;
  }

  async uploadContacts(campaignId: string, file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/contacts/upload`, {
      method: 'POST',
      headers: this.getAuthHeadersForFormData(),
      body: formData,
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
      `${API_BASE_URL}/campaigns/${campaignId}/contacts?page=${page}&limit=${limit}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao buscar contatos');
    }

    return response.json();
  }

  async updateContactStatus(contactId: string, status: string): Promise<Contact> {
    const response = await fetch(`${API_BASE_URL}/contacts/${contactId}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ external_status: status }),
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
    const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/send`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
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
      `${API_BASE_URL}/campaigns/${campaignId}/logs?page=${page}&limit=${limit}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao buscar logs de mensagens');
    }

    return response.json();
  }

  async getCampaigns(): Promise<Campaign[]> {
    const response = await fetch(`${API_BASE_URL}/campaigns`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar campanhas');
    }

    const data = await response.json();
    return data.campaigns || [];
  }
}

export const apiService = new ApiService();
