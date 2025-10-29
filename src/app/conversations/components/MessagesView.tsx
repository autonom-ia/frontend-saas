import { useEffect, useRef, useState } from "react";
import { Send, Paperclip, Smile, MoreVertical, Phone, Video, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import MessageBubble from "./MessageBubble";

interface MessagesViewProps {
  conversation: {
    id: number;
    contactName: string;
    contactAvatar: string;
    status: string;
    channel: string;
  };
  messages: Array<{
    id: number;
    conversationId: number;
    content: string;
    messageType: "incoming" | "outgoing";
    timestamp: number;
    sender: {
      name: string;
      avatar: string;
      isAgent: boolean;
    };
  }>;
  onSendMessage?: (message: string) => void;
}

export default function MessagesView({
  conversation,
  messages,
  onSendMessage,
}: MessagesViewProps) {
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (messageInput.trim()) {
      onSendMessage?.(messageInput);
      setMessageInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={conversation.contactAvatar} alt={conversation.contactName} />
            <AvatarFallback>{conversation.contactName[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-foreground">{conversation.contactName}</h3>
            <p className="text-xs text-muted-foreground">
              {conversation.channel} • {conversation.status}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Phone className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-background/50">
        <div className="max-w-4xl mx-auto">
          {messages
            .filter((m) => m.conversationId === conversation.id)
            .map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-2">
            <Button variant="ghost" size="icon" className="flex-shrink-0">
              <Paperclip className="w-5 h-5" />
            </Button>

            <div className="flex-1 relative">
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                rows={1}
                className="w-full px-4 py-3 pr-10 rounded-lg bg-secondary border border-border text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary min-h-[48px] max-h-[120px]"
                style={{
                  scrollbarWidth: "thin",
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 bottom-2"
              >
                <Smile className="w-5 h-5" />
              </Button>
            </div>

            <Button
              onClick={handleSend}
              disabled={!messageInput.trim()}
              className="flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            Pressione Enter para enviar, Shift + Enter para nova linha
          </p>
        </div>
      </div>
    </div>
  );
}
