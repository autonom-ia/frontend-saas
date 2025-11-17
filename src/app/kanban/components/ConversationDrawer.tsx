"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { X, Send, Users, Loader2, FileText, Download, Play, Image as ImageIcon, User, Tag } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import chatwootService, { type ChatwootMessage, type ChatwootConversation } from "@/services/chatwoot";

interface ConversationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  itemData?: {
    id?: string | number;
    title?: string;
    contact_name?: string;
    user_session_conversation_id?: number | string;
    user_session_inbox_id?: number | string;
  };
  proxyUrl?: string;
  accountId?: string;
}

function MessageBubble({ message }: { message: ChatwootMessage }) {
  const { theme } = useTheme();
  const kanban = theme.colors.kanban;
  
  // message_type: 0=incoming, 1=outgoing, 2=activity
  const isOutgoing = message.message_type === 1;
  const isActivity = message.message_type === 2;
  
  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Activity messages (system messages)
  if (isActivity) {
    return (
      <div className="flex justify-center mb-4">
        <div className={`text-xs px-4 py-2 rounded-full ${theme.colors.background.secondary} ${theme.colors.text.muted}`}>
          {message.content}
        </div>
      </div>
    );
  }

  const renderAttachment = (attachment: { id: number; file_type: string; data_url: string }) => {
    const fileType = attachment.file_type?.toLowerCase() || '';
    
    // Images
    if (fileType.includes('image')) {
      return (
        <a href={attachment.data_url} target="_blank" rel="noopener noreferrer" className="block">
          <img
            src={attachment.data_url}
            alt="Attachment"
            className="max-w-full max-h-64 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            loading="lazy"
          />
        </a>
      );
    }
    
    // Videos
    if (fileType.includes('video')) {
      return (
        <video
          src={attachment.data_url}
          controls
          className="max-w-full max-h-64 rounded-lg"
          preload="metadata"
        >
          Seu navegador não suporta vídeo.
        </video>
      );
    }
    
    // Audio
    if (fileType.includes('audio')) {
      return (
        <div className={`rounded-lg p-3 min-w-[280px] ${theme.colors.background.secondary}`}>
          <audio src={attachment.data_url} controls className="w-full">
            Seu navegador não suporta áudio.
          </audio>
        </div>
      );
    }
    
    // Documents and other files
    const fileName = attachment.data_url.split('/').pop() || 'arquivo';
    return (
      <a
        href={attachment.data_url}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-3 transition-colors rounded-lg p-3 ${theme.colors.background.secondary} ${theme.colors.background.hover}`}
      >
        <FileText className={`w-8 h-8 flex-shrink-0 ${theme.colors.text.secondary}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${theme.colors.text.primary}`}>{fileName}</p>
          <p className={`text-xs ${theme.colors.text.muted}`}>{fileType.toUpperCase()}</p>
        </div>
        <Download className={`w-5 h-5 flex-shrink-0 ${theme.colors.text.secondary}`} />
      </a>
    );
  };

  const hasAttachments = message.attachments && message.attachments.length > 0;
  const hasContent = message.content && message.content.trim().length > 0;

  return (
    <div className={`flex gap-3 mb-4 ${isOutgoing ? "flex-row-reverse" : "flex-row"}`}>
      {!isOutgoing && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.sender?.avatar_url} alt={message.sender?.name} />
          <AvatarFallback className="bg-blue-600 text-white font-semibold">{message.sender?.name?.[0] || "?"}</AvatarFallback>
        </Avatar>
      )}

      <div className={`flex flex-col max-w-[70%] ${isOutgoing ? "items-end" : "items-start"}`}>
        {/* Text content */}
        {hasContent && (
          <div
            className={`rounded-2xl px-4 py-2 break-words ${
              isOutgoing
                ? `${kanban.messageOutgoing} rounded-br-sm`
                : `${kanban.messageIncoming} rounded-bl-sm`
            } ${hasAttachments ? 'mb-2' : ''}`}
          >
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>
        )}

        {/* Attachments */}
        {hasAttachments && (
          <div className="flex flex-col gap-2 w-full">
            {message.attachments?.map((attachment) => (
              <div key={attachment.id} className={`${!hasContent && isOutgoing ? kanban.messageOutgoing : !hasContent && !isOutgoing ? kanban.messageIncoming : ''} ${!hasContent ? 'rounded-2xl p-2' : ''}`}>
                {renderAttachment(attachment)}
              </div>
            ))}
          </div>
        )}

        <span className={`text-xs mt-1 ${theme.colors.text.muted}`}>{formatTime(message.created_at)}</span>
      </div>

      {isOutgoing && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.sender?.avatar_url} alt={message.sender?.name} />
          <AvatarFallback className="bg-green-600 text-white font-semibold">{message.sender?.name?.[0] || "A"}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

export default function ConversationDrawer({ 
  isOpen, 
  onClose, 
  itemData,
  proxyUrl,
  accountId
}: ConversationDrawerProps) {
  const { theme } = useTheme();
  const kanban = theme.colors.kanban;
  
  const [messageInput, setMessageInput] = useState("");
  const [showContactSidebar, setShowContactSidebar] = useState(true);
  const [messages, setMessages] = useState<ChatwootMessage[]>([]);
  const [conversation, setConversation] = useState<ChatwootConversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initRef = useRef(false);

  // Initialize Chatwoot and load conversation
  useEffect(() => {
    if (!isOpen || !itemData?.user_session_conversation_id || !proxyUrl || !accountId) {
      return;
    }

    // Prevent multiple initializations
    if (initRef.current) return;
    initRef.current = true;

    const loadConversation = async () => {
      try {
        setLoading(true);
        setError("");

        console.log('[ConversationDrawer] Initializing Chatwoot proxy...');
        
        // Initialize Chatwoot service with proxy
        await chatwootService.initialize(proxyUrl, accountId);

        const conversationId = itemData.user_session_conversation_id;
        if (!conversationId) {
          throw new Error('ID da conversa não fornecido');
        }

        console.log('[ConversationDrawer] Loading conversation:', conversationId);
        
        // Load conversation details
        const conv = await chatwootService.getConversation(conversationId);
        setConversation(conv);

        // Load messages
        const msgs = await chatwootService.getMessages(conversationId);
        setMessages(msgs);

        console.log('[ConversationDrawer] Loaded', msgs.length, 'messages');
      } catch (err) {
        console.error('[ConversationDrawer] Error loading conversation:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar conversa');
      } finally {
        setLoading(false);
      }
    };

    loadConversation();

    return () => {
      initRef.current = false;
    };
  }, [isOpen, itemData?.user_session_conversation_id, proxyUrl, accountId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!messageInput.trim() || !itemData?.user_session_conversation_id) return;

    try {
      setSending(true);
      const content = messageInput.trim();
      setMessageInput(""); // Clear immediately for better UX

      console.log('[ConversationDrawer] Sending message:', content);
      
      const newMessage = await chatwootService.sendMessage(
        itemData.user_session_conversation_id,
        content,
        'outgoing'
      );

      // Add message to list
      setMessages(prev => [...prev, newMessage]);
    } catch (err) {
      console.error('[ConversationDrawer] Error sending message:', err);
      setError('Erro ao enviar mensagem');
      // Restore message input on error
      setMessageInput(messageInput);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const contactName = conversation?.meta?.sender?.name || itemData?.contact_name || itemData?.title || "Cliente";
  const contactAvatar = conversation?.meta?.sender?.thumbnail;
  const contactEmail = conversation?.meta?.sender?.email;
  const contactPhone = conversation?.meta?.sender?.phone_number;
  const channel = conversation?.meta?.channel || "unknown";
  const status = conversation?.status || "open";

  const statusLabel = status === 'open' ? 'Aberta' : status === 'resolved' ? 'Resolvida' : 'Pendente';
  const channelLabel = channel === 'Channel::WhatsApp' ? 'WhatsApp' : 
                       channel === 'Channel::WebWidget' ? 'Web' :
                       channel === 'Channel::Email' ? 'Email' :
                       channel === 'Channel::Api' ? 'API' : 'Desconhecido';

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full border-l z-[80] transition-transform duration-300 ease-out flex ${
          kanban.drawer
        } ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } ${showContactSidebar ? "w-[75vw]" : "w-[60vw]"}`}
      >
        {/* Main Conversation Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b backdrop-blur ${kanban.drawer}`}>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={contactAvatar} alt={contactName} />
                <AvatarFallback className="bg-blue-600 text-white font-semibold text-lg">{contactName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className={`font-semibold ${theme.colors.text.primary}`}>{contactName}</h3>
                <p className={`text-xs ${theme.colors.text.muted}`}>{channelLabel} • {statusLabel}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className={theme.colors.button.ghost}
                onClick={() => setShowContactSidebar(!showContactSidebar)}
                title="Informações do contato"
              >
                <Users className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={theme.colors.button.ghost}
                onClick={onClose}
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div className={`flex-1 overflow-y-auto p-4 ${kanban.drawerMessages}`}>
            <div className="max-w-4xl mx-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-red-400 mb-2">{error}</p>
                    <Button onClick={onClose} variant="outline" className={theme.colors.button.outline}>Fechar</Button>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className={`flex items-center justify-center h-full ${theme.colors.text.muted}`}>
                  Nenhuma mensagem nesta conversa
                </div>
              ) : (
                messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className={`p-4 border-t ${kanban.drawer}`}>
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-2">
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  rows={1}
                  className={`flex-1 px-4 py-3 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 h-12 ${kanban.input}`}
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                />

                <Button
                  onClick={handleSend}
                  disabled={!messageInput.trim() || sending || loading}
                  className="flex-shrink-0 h-12 w-12 bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Enviar mensagem"
                >
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Sidebar */}
        {showContactSidebar && (
          <div className={`w-80 border-l overflow-y-auto ${kanban.drawer}`}>
            <div className={`p-6 border-b text-center ${theme.colors.border.primary}`}>
              <Avatar className="h-20 w-20 mx-auto mb-3">
                <AvatarImage src={contactAvatar} alt={contactName} />
                <AvatarFallback className="bg-blue-600 text-white font-semibold text-2xl">{contactName[0]}</AvatarFallback>
              </Avatar>
              <h3 className={`font-semibold text-lg mb-1 ${theme.colors.text.primary}`}>{contactName}</h3>
              <p className={`text-sm ${theme.colors.text.muted}`}>Cliente</p>
            </div>

            {/* Contact Information */}
            <div className={`p-4 space-y-4 border-b ${theme.colors.border.primary}`}>
              {contactEmail && (
                <div>
                  <p className={`text-xs mb-1 ${theme.colors.text.muted}`}>Email</p>
                  <p className={`text-sm break-all ${theme.colors.text.primary}`}>{contactEmail}</p>
                </div>
              )}

              {contactPhone && (
                <div>
                  <p className={`text-xs mb-1 ${theme.colors.text.muted}`}>Telefone</p>
                  <p className={`text-sm ${theme.colors.text.primary}`}>{contactPhone}</p>
                </div>
              )}

              {conversation?.meta?.sender?.custom_attributes && (
                Object.entries(conversation.meta.sender.custom_attributes).map(([key, value]) => (
                  <div key={key}>
                    <p className={`text-xs mb-1 capitalize ${theme.colors.text.muted}`}>{key.replace(/_/g, ' ')}</p>
                    <p className={`text-sm ${theme.colors.text.primary}`}>{String(value)}</p>
                  </div>
                ))
              )}
            </div>

            {/* Conversation Actions */}
            <div className="p-4">
              <h4 className={`text-sm font-semibold mb-4 ${theme.colors.text.primary}`}>Ções da conversa</h4>
              
              {/* Assigned Agent */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className={`w-4 h-4 ${theme.colors.text.muted}`} />
                  <p className={`text-xs ${theme.colors.text.muted}`}>Agente atribuído</p>
                </div>
                {conversation?.meta?.assignee ? (
                  <div className={`flex items-center gap-2 rounded-lg p-2 ${theme.colors.background.secondary}`}>
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={conversation.meta.assignee.avatar_url} alt={conversation.meta.assignee.name} />
                      <AvatarFallback className="bg-green-600 text-white font-semibold text-xs">{conversation.meta.assignee.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className={`text-sm ${theme.colors.text.primary}`}>{conversation.meta.assignee.name}</span>
                  </div>
                ) : (
                  <p className={`text-sm italic ${theme.colors.text.muted}`}>Nenhum</p>
                )}
              </div>

              {/* Priority */}
              <div className="mb-4">
                <p className={`text-xs mb-2 ${theme.colors.text.muted}`}>Prioridade</p>
                <div className={`rounded-lg p-2 ${theme.colors.background.secondary}`}>
                  <span className={`text-sm font-medium ${
                    conversation?.priority === 'urgent' ? 'text-red-400' :
                    conversation?.priority === 'high' ? 'text-orange-400' :
                    conversation?.priority === 'medium' ? 'text-yellow-400' :
                    conversation?.priority === 'low' ? 'text-green-400' :
                    'text-neutral-400'
                  }`}>
                    {conversation?.priority === 'urgent' ? 'Urgente' :
                     conversation?.priority === 'high' ? 'Alta' :
                     conversation?.priority === 'medium' ? 'Média' :
                     conversation?.priority === 'low' ? 'Baixa' :
                     'Nenhuma'}
                  </span>
                </div>
              </div>

              {/* Labels */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className={`w-4 h-4 ${theme.colors.text.muted}`} />
                  <p className={`text-xs ${theme.colors.text.muted}`}>Etiquetas da conversa</p>
                </div>
                {conversation?.labels && conversation.labels.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {conversation.labels.map((label, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${kanban.tag}`}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm italic ${theme.colors.text.muted}`}>Nenhuma etiqueta</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
