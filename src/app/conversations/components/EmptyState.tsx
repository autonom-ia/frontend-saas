import { MessageCircle, Inbox } from "lucide-react";

interface EmptyStateProps {
  type: "no-selection" | "no-conversations";
}

export default function EmptyState({ type }: EmptyStateProps) {
  if (type === "no-selection") {
    return (
      <div className="flex-1 flex items-center justify-center bg-background/50">
        <div className="text-center max-w-md px-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <MessageCircle className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-3">
            Nenhuma conversa selecionada
          </h3>
          <p className="text-sm text-muted-foreground">
            Selecione uma conversa da lista à esquerda para visualizar as mensagens
            e iniciar o atendimento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-background/50">
      <div className="text-center max-w-md px-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 mb-6">
          <Inbox className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-3">
          Nenhuma conversa encontrada
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Não há conversas correspondentes aos seus filtros atuais. Tente ajustar
          os filtros ou aguarde novas conversas chegarem.
        </p>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
          Limpar Filtros
        </button>
      </div>
    </div>
  );
}
