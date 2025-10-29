import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  MessageSquare,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

interface ContactSidebarProps {
  contact: {
    id: number;
    name: string;
    email: string;
    phone: string;
    avatar: string;
    createdAt: number;
    lastSeenAt: number;
    conversationsCount: number;
    customAttributes: Record<string, string>;
  };
  onClose: () => void;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function AccordionSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-4 hover:bg-secondary/50 transition-colors"
      >
        <h3 className="font-medium text-sm text-foreground">{title}</h3>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {isOpen && <div className="p-4 pt-0">{children}</div>}
    </div>
  );
}

export default function ContactSidebar({ contact, onClose }: ContactSidebarProps) {
  return (
    <div className="w-80 border-l border-border h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Informações do Contato</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Contact Profile */}
        <div className="p-6 border-b border-border text-center">
          <Avatar className="h-20 w-20 mx-auto mb-3">
            <AvatarImage src={contact.avatar} alt={contact.name} />
            <AvatarFallback className="text-2xl">{contact.name[0]}</AvatarFallback>
          </Avatar>
          <h3 className="font-semibold text-lg text-foreground mb-1">
            {contact.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            Cliente desde {formatDate(contact.createdAt)}
          </p>
        </div>

        {/* Contact Details */}
        <AccordionSection title="Detalhes do Contato" defaultOpen>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                <p className="text-sm text-foreground break-all">{contact.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Telefone</p>
                <p className="text-sm text-foreground">{contact.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Última atividade</p>
                <p className="text-sm text-foreground">{formatDate(contact.lastSeenAt)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Total de conversas</p>
                <p className="text-sm text-foreground">{contact.conversationsCount}</p>
              </div>
            </div>
          </div>
        </AccordionSection>

        {/* Custom Attributes */}
        <AccordionSection title="Atributos Personalizados" defaultOpen>
          <div className="space-y-3">
            {Object.entries(contact.customAttributes).map(([key, value]) => (
              <div key={key} className="flex items-start gap-3">
                <Building2 className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5 capitalize">
                    {key.replace("_", " ")}
                  </p>
                  <p className="text-sm text-foreground">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </AccordionSection>

        {/* Actions */}
        <AccordionSection title="Ações da Conversa" defaultOpen>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" size="sm">
              Resolver Conversa
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              Transferir para Equipe
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              Adicionar Etiqueta
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:text-destructive"
              size="sm"
            >
              Silenciar Conversa
            </Button>
          </div>
        </AccordionSection>

        {/* Previous Conversations */}
        <AccordionSection title="Conversas Anteriores">
          <p className="text-sm text-muted-foreground">
            Histórico de {contact.conversationsCount} conversas
          </p>
          <Button variant="outline" className="w-full mt-3" size="sm">
            Ver Histórico Completo
          </Button>
        </AccordionSection>
      </div>
    </div>
  );
}
