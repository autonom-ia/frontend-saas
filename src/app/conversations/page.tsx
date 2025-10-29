"use client";

import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";
import ConversationsHeader from "./components/ConversationsHeader";
import ConversationsList from "./components/ConversationsList";
import MessagesView from "./components/MessagesView";
import ContactSidebar from "./components/ContactSidebar";
import EmptyState from "./components/EmptyState";
import { mockConversations, mockMessages, mockContactInfo } from "./mock-data";

export default function ConversationsPage() {
  const [activeConversationId, setActiveConversationId] = useState<number | null>(2);
  const [showContactSidebar, setShowContactSidebar] = useState(true);
  const [showHeader, setShowHeader] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Staged entrance animation
  useEffect(() => {
    const t1 = setTimeout(() => setShowHeader(true), 160);
    const t2 = setTimeout(() => setShowMenu(true), 420);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const activeConversation = mockConversations.find(
    (c) => c.id === activeConversationId
  );

  const conversationMessages = mockMessages.filter(
    (m) => m.conversationId === activeConversationId
  );

  const handleSendMessage = (message: string) => {
    console.log("Enviando mensagem:", message);
    // Aqui você integrará com a API depois
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div
          className={`transition-all duration-300 ${
            showHeader ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
          }`}
        >
          <ConversationsHeader
            userName="Agente"
            userInitials="AG"
          />
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden pt-16">
          {/* Sidebar */}
          <div
            className={`transition-all duration-300 ${
              showMenu ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
            }`}
          >
            <Sidebar />
          </div>

          {/* 3-Column Layout */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Conversations List */}
            <div className="w-80 flex-shrink-0">
              <ConversationsList
                conversations={mockConversations}
                activeConversationId={activeConversationId ?? undefined}
                onConversationSelect={setActiveConversationId}
              />
            </div>

            {/* Center: Messages View */}
            <div className="flex-1 flex flex-col min-w-0">
              {activeConversation ? (
                <MessagesView
                  conversation={{
                    id: activeConversation.id,
                    contactName: activeConversation.contactName,
                    contactAvatar: activeConversation.contactAvatar,
                    status: activeConversation.status,
                    channel: activeConversation.channel,
                  }}
                  messages={conversationMessages}
                  onSendMessage={handleSendMessage}
                />
              ) : (
                <EmptyState type="no-selection" />
              )}
            </div>

            {/* Right: Contact Sidebar */}
            {showContactSidebar && activeConversation && (
              <ContactSidebar
                contact={mockContactInfo}
                onClose={() => setShowContactSidebar(false)}
              />
            )}
          </div>
        </div>

        {/* Toggle Contact Sidebar Button (when hidden) */}
        {!showContactSidebar && activeConversation && (
          <button
            onClick={() => setShowContactSidebar(true)}
            className="fixed right-4 bottom-4 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors"
            title="Mostrar informações do contato"
          >
            <Users className="w-6 h-6" />
          </button>
        )}
      </div>
    </AuthGuard>
  );
}
