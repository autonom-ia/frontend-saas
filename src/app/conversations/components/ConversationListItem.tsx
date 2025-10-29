import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Mail, Instagram, Phone } from "lucide-react";

interface ConversationListItemProps {
  conversation: {
    id: number;
    contactName: string;
    contactAvatar: string;
    lastMessage: string;
    timestamp: number;
    unreadCount: number;
    status: "open" | "resolved" | "pending" | "snoozed";
    channel: "whatsapp" | "web" | "email" | "instagram" | "phone";
    assignee: string | null;
  };
  isActive?: boolean;
  onClick?: () => void;
}

const channelIcons = {
  whatsapp: Phone,
  web: MessageCircle,
  email: Mail,
  instagram: Instagram,
  phone: Phone,
};

const statusColors = {
  open: "bg-green-500",
  resolved: "bg-gray-500",
  pending: "bg-yellow-500",
  snoozed: "bg-blue-500",
};

function formatTimestamp(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  return `${days}d`;
}

export default function ConversationListItem({
  conversation,
  isActive = false,
  onClick,
}: ConversationListItemProps) {
  const ChannelIcon = channelIcons[conversation.channel];

  return (
    <div
      onClick={onClick}
      className={`
        flex items-start gap-3 p-3 cursor-pointer transition-colors border-l-2
        ${
          isActive
            ? "bg-primary/10 border-l-primary"
            : "hover:bg-secondary/50 border-l-transparent"
        }
      `}
    >
      <div className="relative flex-shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={conversation.contactAvatar} alt={conversation.contactName} />
          <AvatarFallback>{conversation.contactName[0]}</AvatarFallback>
        </Avatar>
        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${statusColors[conversation.status]}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h4 className="font-medium text-sm truncate text-foreground">
            {conversation.contactName}
          </h4>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {formatTimestamp(conversation.timestamp)}
          </span>
        </div>

        <p className="text-sm text-muted-foreground truncate mb-1">
          {conversation.lastMessage}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChannelIcon className="w-3 h-3 text-muted-foreground" />
            {conversation.assignee && (
              <span className="text-xs text-muted-foreground">
                {conversation.assignee}
              </span>
            )}
          </div>

          {conversation.unreadCount > 0 && (
            <span className="bg-primary text-primary-foreground text-xs font-semibold rounded-full px-2 py-0.5 min-w-[20px] text-center">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
