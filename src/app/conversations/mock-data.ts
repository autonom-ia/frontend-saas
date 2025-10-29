// Mock data para validação de layout

export const mockConversations = [
  {
    id: 1,
    contactName: "João Silva",
    contactAvatar: "https://ui-avatars.com/api/?name=Joao+Silva&background=47B5FF&color=fff",
    lastMessage: "Obrigado pelo atendimento!",
    timestamp: Date.now() - 1000 * 60 * 5, // 5 min atrás
    unreadCount: 0,
    status: "resolved" as const,
    channel: "whatsapp" as const,
    assignee: "Maria Santos"
  },
  {
    id: 2,
    contactName: "Ana Paula",
    contactAvatar: "https://ui-avatars.com/api/?name=Ana+Paula&background=F59E0B&color=fff",
    lastMessage: "Preciso de ajuda com meu pedido",
    timestamp: Date.now() - 1000 * 60 * 15, // 15 min atrás
    unreadCount: 3,
    status: "open" as const,
    channel: "web" as const,
    assignee: "Você"
  },
  {
    id: 3,
    contactName: "Carlos Oliveira",
    contactAvatar: "https://ui-avatars.com/api/?name=Carlos+Oliveira&background=10B981&color=fff",
    lastMessage: "Qual o prazo de entrega?",
    timestamp: Date.now() - 1000 * 60 * 30, // 30 min atrás
    unreadCount: 1,
    status: "open" as const,
    channel: "email" as const,
    assignee: null
  },
  {
    id: 4,
    contactName: "Fernanda Costa",
    contactAvatar: "https://ui-avatars.com/api/?name=Fernanda+Costa&background=8B5CF6&color=fff",
    lastMessage: "Gostaria de saber mais sobre o produto",
    timestamp: Date.now() - 1000 * 60 * 60, // 1h atrás
    unreadCount: 0,
    status: "pending" as const,
    channel: "instagram" as const,
    assignee: "Pedro Alves"
  },
  {
    id: 5,
    contactName: "Roberto Martins",
    contactAvatar: "https://ui-avatars.com/api/?name=Roberto+Martins&background=EF4444&color=fff",
    lastMessage: "Ótimo! Vou aguardar então",
    timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2h atrás
    unreadCount: 0,
    status: "resolved" as const,
    channel: "whatsapp" as const,
    assignee: "Você"
  }
];

export const mockMessages = [
  {
    id: 1,
    conversationId: 2,
    content: "Olá! Como posso ajudar você hoje?",
    messageType: "outgoing" as const,
    timestamp: Date.now() - 1000 * 60 * 25,
    sender: {
      name: "Você",
      avatar: "https://ui-avatars.com/api/?name=Agent&background=47B5FF&color=fff",
      isAgent: true
    }
  },
  {
    id: 2,
    conversationId: 2,
    content: "Olá! Fiz um pedido há 3 dias e ainda não recebi a confirmação de envio. Meu número de pedido é #12345",
    messageType: "incoming" as const,
    timestamp: Date.now() - 1000 * 60 * 23,
    sender: {
      name: "Ana Paula",
      avatar: "https://ui-avatars.com/api/?name=Ana+Paula&background=F59E0B&color=fff",
      isAgent: false
    }
  },
  {
    id: 3,
    conversationId: 2,
    content: "Entendo sua preocupação. Deixa eu verificar o status do seu pedido #12345 aqui no sistema.",
    messageType: "outgoing" as const,
    timestamp: Date.now() - 1000 * 60 * 21,
    sender: {
      name: "Você",
      avatar: "https://ui-avatars.com/api/?name=Agent&background=47B5FF&color=fff",
      isAgent: true
    }
  },
  {
    id: 4,
    conversationId: 2,
    content: "Encontrei! Seu pedido foi despachado ontem às 14h30. O código de rastreio é BR123456789BR. Você pode acompanhar em: www.correios.com.br",
    messageType: "outgoing" as const,
    timestamp: Date.now() - 1000 * 60 * 20,
    sender: {
      name: "Você",
      avatar: "https://ui-avatars.com/api/?name=Agent&background=47B5FF&color=fff",
      isAgent: true
    }
  },
  {
    id: 5,
    conversationId: 2,
    content: "Ah que bom! Não tinha recebido o email de confirmação, por isso fiquei preocupada.",
    messageType: "incoming" as const,
    timestamp: Date.now() - 1000 * 60 * 18,
    sender: {
      name: "Ana Paula",
      avatar: "https://ui-avatars.com/api/?name=Ana+Paula&background=F59E0B&color=fff",
      isAgent: false
    }
  },
  {
    id: 6,
    conversationId: 2,
    content: "Vou reenviar o email de confirmação para você agora mesmo. Verifique sua caixa de entrada nos próximos minutos, ok?",
    messageType: "outgoing" as const,
    timestamp: Date.now() - 1000 * 60 * 17,
    sender: {
      name: "Você",
      avatar: "https://ui-avatars.com/api/?name=Agent&background=47B5FF&color=fff",
      isAgent: true
    }
  },
  {
    id: 7,
    conversationId: 2,
    content: "Perfeito! Muito obrigada pelo atendimento rápido 😊",
    messageType: "incoming" as const,
    timestamp: Date.now() - 1000 * 60 * 16,
    sender: {
      name: "Ana Paula",
      avatar: "https://ui-avatars.com/api/?name=Ana+Paula&background=F59E0B&color=fff",
      isAgent: false
    }
  },
  {
    id: 8,
    conversationId: 2,
    content: "Preciso de ajuda com meu pedido",
    messageType: "incoming" as const,
    timestamp: Date.now() - 1000 * 60 * 15,
    sender: {
      name: "Ana Paula",
      avatar: "https://ui-avatars.com/api/?name=Ana+Paula&background=F59E0B&color=fff",
      isAgent: false
    }
  }
];

export const mockContactInfo = {
  id: 2,
  name: "Ana Paula",
  email: "ana.paula@example.com",
  phone: "+55 11 98765-4321",
  avatar: "https://ui-avatars.com/api/?name=Ana+Paula&background=F59E0B&color=fff",
  createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30, // 30 dias atrás
  lastSeenAt: Date.now() - 1000 * 60 * 10,
  conversationsCount: 8,
  customAttributes: {
    company: "Acme Corp",
    city: "São Paulo",
    source: "Website"
  }
};
