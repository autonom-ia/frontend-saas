export default function TypingIndicator({ userName }: { userName: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex gap-1 bg-secondary rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
      </div>
      <span className="text-xs text-muted-foreground">{userName} está digitando...</span>
    </div>
  );
}
