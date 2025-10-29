import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import ConversationListItem from "./ConversationListItem";

interface ConversationsListProps {
  conversations: Array<{
    id: number;
    contactName: string;
    contactAvatar: string;
    lastMessage: string;
    timestamp: number;
    unreadCount: number;
    status: "open" | "resolved" | "pending" | "snoozed";
    channel: "whatsapp" | "web" | "email" | "instagram" | "phone";
    assignee: string | null;
  }>;
  activeConversationId?: number;
  onConversationSelect: (id: number) => void;
}

export default function ConversationsList({
  conversations,
  activeConversationId,
  onConversationSelect,
}: ConversationsListProps) {
  return (
    <div className="flex flex-col h-full border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold mb-3 text-foreground">Conversas</h2>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar conversas..."
            className="pl-9 bg-secondary border-border"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 p-3 border-b border-border overflow-x-auto">
        <button className="px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground whitespace-nowrap">
          Todas (5)
        </button>
        <button className="px-3 py-1.5 text-xs font-medium rounded-md hover:bg-secondary text-muted-foreground whitespace-nowrap">
          Minhas (2)
        </button>
        <button className="px-3 py-1.5 text-xs font-medium rounded-md hover:bg-secondary text-muted-foreground whitespace-nowrap">
          Não atribuídas (1)
        </button>
        <button className="px-3 py-1.5 text-xs font-medium rounded-md hover:bg-secondary text-muted-foreground">
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation) => (
          <ConversationListItem
            key={conversation.id}
            conversation={conversation}
            isActive={conversation.id === activeConversationId}
            onClick={() => onConversationSelect(conversation.id)}
          />
        ))}
      </div>
    </div>
  );
}
