"use client";

import React from "react";
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
  const { name, isAdmin, onEdit, onInbox, onSettings, onChangeAccount } = props;
  return (
    <div className="sticky top-10 z-[30] bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 py-2 px-3 rounded">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-300">Conta selecionada</span>
          <div className="text-base font-semibold dark:text-white">{name || 'Conta'}</div>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <Button
                size="sm"
                variant="secondary"
                className="bg-gray-700 hover:bg-gray-600 text-white"
                onClick={onEdit}
                title="Editar conta"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="bg-gray-700 hover:bg-gray-600 text-white"
                onClick={onInbox}
                title="Inboxes e WhatsApp"
              >
                <Phone className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="bg-gray-700 hover:bg-gray-600 text-white"
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
            className="bg-gray-700 hover:bg-gray-600 text-white"
            onClick={onChangeAccount}
          >
            Trocar conta
          </Button>
        </div>
      </div>
    </div>
  );
}
