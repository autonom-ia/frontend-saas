"use client";

import { Button } from "@/components/ui/button";
import React from "react";

type Funnel = { id: string; name: string; description?: string };

export type AccountFormProps = {
  open: boolean;
  mode: "create" | "edit";
  name: string;
  email: string;
  phone: string;
  domain: string;
  funnelId: string;
  funnels: Funnel[];
  funnelsLoading?: boolean;
  isAdmin?: boolean;
  saving?: boolean;
  onChange: (fields: Partial<{ name: string; email: string; phone: string; domain: string; funnelId: string }>) => void;
  onSave: () => void;
  onClose: () => void;
  onOpenCreateFunnel?: () => void;
};

export default function AccountForm(props: AccountFormProps) {
  const {
    open,
    mode,
    name,
    email,
    phone,
    domain,
    funnelId,
    funnels,
    funnelsLoading,
    isAdmin,
    saving,
    onChange,
    onSave,
    onClose,
    onOpenCreateFunnel,
  } = props;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}
        aria-hidden={!open}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold dark:text-white">
            {mode === "create" ? "Adicionar Conta" : "Editar Conta"}
          </h2>
          <button
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
            onClick={onClose}
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label htmlFor="acc-name" className="block text-sm mb-1 dark:text-gray-200">Nome</label>
            <input
              id="acc-name"
              type="text"
              className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={(e) => onChange({ name: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="acc-email" className="block text-sm mb-1 dark:text-gray-200">Email</label>
            <input
              id="acc-email"
              type="email"
              className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => onChange({ email: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="acc-phone" className="block text-sm mb-1 dark:text-gray-200">Telefone</label>
            <input
              id="acc-phone"
              type="text"
              className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={phone}
              onChange={(e) => onChange({ phone: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="acc-domain" className="block text-sm mb-1 dark:text-gray-200">Domínio</label>
            <input
              id="acc-domain"
              type="text"
              className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={domain}
              onChange={(e) => onChange({ domain: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="acc-funnel" className="block text-sm mb-1 dark:text-gray-200">Funil Conversacional</label>
            <div className="flex items-center gap-2">
              <select
                id="acc-funnel"
                className="select-clean w-full"
                value={funnelId}
                onChange={(e) => onChange({ funnelId: e.target.value })}
              >
                <option value="">Selecione um funil</option>
                {funnelsLoading ? (
                  <option value="" disabled>Carregando...</option>
                ) : (
                  funnels.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))
                )}
              </select>
              {isAdmin && (
                <Button
                  type="button"
                  onClick={onOpenCreateFunnel}
                  title="Incluir novo funil"
                  className="bg-blue-600 hover:bg-blue-500 text-white"
                  size="sm"
                >
                  +
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
          <Button
            variant="secondary"
            className="bg-gray-700 hover:bg-gray-600 text-white"
            onClick={onClose}
            disabled={!!saving}
          >Cancelar</Button>
          <Button
            className="bg-blue-600 hover:bg-blue-500 text-white"
            onClick={onSave}
            disabled={!!saving || !name.trim()}
          >{saving ? 'Salvando...' : 'Salvar'}</Button>
        </div>
      </div>
    </>
  );
}
