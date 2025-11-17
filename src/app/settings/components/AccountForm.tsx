"use client";

import { useTheme } from "@/contexts/ThemeContext";
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
  const { theme } = useTheme();
  const settings = theme.colors.settings;
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
        className={`fixed right-0 top-0 h-full w-full max-w-md shadow-xl z-50 transform transition-transform duration-300 ease-out ${settings.form} ${open ? "translate-x-0" : "translate-x-full"}`}
        aria-hidden={!open}
      >
        <div className={`p-4 border-b flex items-center justify-between ${settings.formBorder}`}>
          <h2 className={`text-lg font-semibold ${theme.colors.text.primary}`}>
            {mode === "create" ? "Adicionar Conta" : "Editar Conta"}
          </h2>
          <button
            className={`${theme.colors.text.muted} ${theme.colors.background.hover}`}
            onClick={onClose}
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label htmlFor="acc-name" className={`block text-sm mb-1 ${theme.colors.text.primary}`}>Nome</label>
            <input
              id="acc-name"
              type="text"
              className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${settings.input}`}
              value={name}
              onChange={(e) => onChange({ name: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="acc-email" className={`block text-sm mb-1 ${theme.colors.text.primary}`}>Email</label>
            <input
              id="acc-email"
              type="email"
              className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${settings.input}`}
              value={email}
              onChange={(e) => onChange({ email: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="acc-phone" className={`block text-sm mb-1 ${theme.colors.text.primary}`}>Telefone</label>
            <input
              id="acc-phone"
              type="text"
              className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${settings.input}`}
              value={phone}
              onChange={(e) => onChange({ phone: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="acc-domain" className={`block text-sm mb-1 ${theme.colors.text.primary}`}>Domínio</label>
            <input
              id="acc-domain"
              type="text"
              className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${settings.input}`}
              value={domain}
              onChange={(e) => onChange({ domain: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="acc-funnel" className={`block text-sm mb-1 ${theme.colors.text.primary}`}>Funil Conversacional</label>
            <div className="flex items-center gap-2">
              <select
                id="acc-funnel"
                className={`w-full rounded-md px-3 py-2 text-sm border ${theme.colors.background.secondary} ${theme.colors.text.primary} ${theme.colors.border.secondary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                style={{
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor'%3E%3Cpath d='M4 6l4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '16px 16px',
                  paddingRight: '2.5rem'
                }}
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
                  className={theme.colors.button.primary}
                  size="sm"
                >
                  +
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className={`p-4 border-t flex items-center justify-end gap-2 ${settings.formBorder}`}>
          <Button
            variant="secondary"
            className={theme.colors.button.secondary}
            onClick={onClose}
            disabled={!!saving}
          >Cancelar</Button>
          <Button
            className={theme.colors.button.primary}
            onClick={onSave}
            disabled={!!saving || !name.trim()}
          >{saving ? 'Salvando...' : 'Salvar'}</Button>
        </div>
      </div>
    </>
  );
}
