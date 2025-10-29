// Chatwoot API Service

interface ChatwootConversation {
  id: number;
  account_id: number;
  inbox_id: number;
  status: string;
  assignee_last_seen_at: number;
  agent_last_seen_at: number;
  unread_count: number;
  created_at: number;
  updated_at: number;
  timestamp: number;
  contact_last_seen_at: number;
  priority?: string | null;
  labels?: string[];
  meta: {
    sender: {
      id: number;
      name: string;
      email?: string;
      phone_number?: string;
      thumbnail?: string;
      custom_attributes?: Record<string, unknown>;
    };
    channel: string;
    assignee?: {
      id: number;
      name: string;
      email: string;
      avatar_url?: string;
    };
  };
  messages?: Array<ChatwootMessage>;
}

interface ChatwootMessage {
  id: number;
  content: string;
  message_type: number;
  created_at: number;
  conversation_id: number;
  sender: {
    id: number;
    name: string;
    email?: string;
    avatar_url?: string;
    type: string;
  };
  attachments?: Array<{
    id: number;
    file_type: string;
    data_url: string;
  }>;
  content_attributes?: Record<string, unknown>;
  content_type?: string;
  private: boolean;
  status?: string;
}

interface ChatwootContact {
  id: number;
  name: string;
  email?: string;
  phone_number?: string;
  thumbnail?: string;
  custom_attributes?: Record<string, unknown>;
  contact_inboxes?: Array<unknown>;
  conversations_count?: number;
}

class ChatwootService {
  private proxyUrl: string = '';
  private accountId: string = '';

  /**
   * Initialize Chatwoot service with proxy
   */
  async initialize(
    proxyUrl: string,
    accountId: string
  ): Promise<void> {
    this.proxyUrl = proxyUrl;
    this.accountId = accountId;

    console.log('[ChatwootService] Initialized:', { 
      proxyUrl: this.proxyUrl,
      accountId: this.accountId
    });
  }

  /**
   * Get conversations for the account
   */
  async getConversations(status: 'open' | 'resolved' | 'pending' | 'all' = 'all'): Promise<ChatwootConversation[]> {
    if (!this.accountId || !this.proxyUrl) {
      throw new Error('ChatwootService not initialized');
    }

    const url = `${this.proxyUrl}?accountId=${this.accountId}&action=getConversations&status=${status}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Falha ao buscar conversas: ${response.status}`);
    }

    const data = await response.json();
    return data.data?.payload || [];
  }

  /**
   * Get a specific conversation by ID
   */
  async getConversation(conversationId: number | string): Promise<ChatwootConversation> {
    if (!this.accountId || !this.proxyUrl) {
      throw new Error('ChatwootService not initialized');
    }

    const url = `${this.proxyUrl}?accountId=${this.accountId}&action=getConversation&conversationId=${conversationId}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Falha ao buscar conversa: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId: number | string): Promise<ChatwootMessage[]> {
    if (!this.accountId || !this.proxyUrl) {
      throw new Error('ChatwootService not initialized');
    }

    const url = `${this.proxyUrl}?accountId=${this.accountId}&action=getMessages&conversationId=${conversationId}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Falha ao buscar mensagens: ${response.status}`);
    }

    const data = await response.json();
    return data.payload || data || [];
  }

  /**
   * Send a message to a conversation
   */
  async sendMessage(
    conversationId: number | string,
    content: string,
    messageType: 'outgoing' | 'incoming' = 'outgoing',
    isPrivate: boolean = false
  ): Promise<ChatwootMessage> {
    if (!this.accountId || !this.proxyUrl) {
      throw new Error('ChatwootService not initialized');
    }

    const url = `${this.proxyUrl}?accountId=${this.accountId}&action=sendMessage&conversationId=${conversationId}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        message_type: messageType,
        private: isPrivate,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Falha ao enviar mensagem: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Update conversation status
   */
  async updateConversationStatus(
    conversationId: number | string,
    status: 'open' | 'resolved' | 'pending'
  ): Promise<void> {
    if (!this.accountId || !this.proxyUrl) {
      throw new Error('ChatwootService not initialized');
    }

    const url = `${this.proxyUrl}?accountId=${this.accountId}&action=updateStatus&conversationId=${conversationId}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Falha ao atualizar status: ${response.status}`);
    }
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return !!(this.proxyUrl && this.accountId);
  }

  /**
   * Clear authentication
   */
  clear(): void {
    this.proxyUrl = '';
    this.accountId = '';
  }
}

// Singleton instance
const chatwootService = new ChatwootService();

export default chatwootService;
export type { ChatwootConversation, ChatwootMessage, ChatwootContact };
