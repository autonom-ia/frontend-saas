import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MessageBubbleProps {
  message: {
    id: number;
    content: string;
    messageType: "incoming" | "outgoing";
    timestamp: number;
    sender: {
      name: string;
      avatar: string;
      isAgent: boolean;
    };
  };
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isOutgoing = message.messageType === "outgoing";

  return (
    <div
      className={`flex gap-3 mb-4 ${
        isOutgoing ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {!isOutgoing && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
          <AvatarFallback>{message.sender.name[0]}</AvatarFallback>
        </Avatar>
      )}

      <div
        className={`flex flex-col max-w-[70%] ${
          isOutgoing ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`
            rounded-2xl px-4 py-2 break-words
            ${
              isOutgoing
                ? "bg-primary text-primary-foreground rounded-br-sm"
                : "bg-secondary text-secondary-foreground rounded-bl-sm"
            }
          `}
        >
          {!isOutgoing && (
            <p className="text-xs font-medium text-muted-foreground mb-1">
              {message.sender.name}
            </p>
          )}
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        <span className="text-xs text-muted-foreground mt-1">
          {formatTime(message.timestamp)}
        </span>
      </div>

      {isOutgoing && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
          <AvatarFallback>{message.sender.name[0]}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
