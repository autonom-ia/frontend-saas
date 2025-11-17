import { MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";

interface ConversationsHeaderProps {
  userName?: string;
  userPhotoUrl?: string;
  userInitials?: string;
}

export default function ConversationsHeader({
  userName = "Agente",
  userPhotoUrl,
  userInitials = "A",
}: ConversationsHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center h-16 bg-gray-800 text-white px-4 border-b border-gray-700">
      {/* Logo */}
      <div className="px-2 flex items-center">
        <Image
          src="/images/logo.png"
          alt="Autonom.ia Logo"
          width={42}
          height={42}
          priority
          fetchPriority="high"
          sizes="42px"
        />
      </div>

      {/* Title */}
      <div className="flex-1 px-4 flex items-center gap-3">
        <MessageCircle className="w-5 h-5 text-primary" />
        <div>
          <h1 className="text-lg font-semibold">Conversas</h1>
          <p className="text-xs text-gray-400">Gerencie todas as conversas com seus clientes</p>
        </div>
      </div>

      {/* User Info */}
      <div className="flex items-center gap-2 cursor-pointer">
        <span className="text-sm">{userName}</span>
        <Avatar>
          {userPhotoUrl ? (
            <AvatarImage src={userPhotoUrl} alt={userName} />
          ) : null}
          <AvatarFallback className="text-white">{userInitials}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
