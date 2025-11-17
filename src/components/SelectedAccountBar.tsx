"use client";

import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Pencil, Phone, Settings } from "lucide-react";

export type SelectedAccountBarProps = {
  name: string;
  isAdmin?: boolean;
  onEdit?: () => void;
  onInbox?: () => void;
  onSettings?: () => void;
  onChangeAccount: () => void;
};

export default function SelectedAccountBar(props: SelectedAccountBarProps) {
  const { theme } = useTheme();
  const { name, isAdmin, onEdit, onInbox, onSettings, onChangeAccount } = props;
  return (
    <div className={`sticky top-5 z-[30] w-full max-w-full backdrop-blur-sm border-b py-2 px-3 rounded ${theme.colors.background.card} ${theme.colors.border.primary}`}>
      <div className="flex items-center justify-between">
        <div>
          <span className={`text-sm ${theme.colors.text.muted}`}>Conta selecionada</span>
          <div className={`text-base font-semibold ${theme.colors.text.primary}`}>{name || 'Conta'}</div>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <Button
                size="sm"
                variant="secondary"
                className={theme.colors.button.secondary}
                onClick={onEdit}
                title="Editar conta"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className={theme.colors.button.secondary}
                onClick={onInbox}
                title="Inboxes e WhatsApp"
              >
                <Phone className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className={theme.colors.button.secondary}
                onClick={onSettings}
                title="Parâmetros da conta"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="secondary"
            className={theme.colors.button.secondary}
            onClick={onChangeAccount}
          >
            Trocar conta
          </Button>
        </div>
      </div>
    </div>
  );
}
