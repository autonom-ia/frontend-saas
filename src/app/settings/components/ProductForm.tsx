"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import React from "react";

export type ProductFormProps = {
  open: boolean;
  mode: "create" | "edit";
  name: string;
  description: string;
  productTypeId?: string;
  productTypes?: Array<{ id: string; description: string }>;
  productTypesLoading?: boolean;
  saving?: boolean;
  onChange: (fields: Partial<{ name: string; description: string; productTypeId: string }>) => void;
  onSave: () => void;
  onClose: () => void;
};

export default function ProductForm(props: ProductFormProps) {
  const { theme } = useTheme();
  const settings = theme.colors.settings;
  const { open, mode, name, description, productTypeId, productTypes, productTypesLoading, saving, onChange, onSave, onClose } = props;

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
            {mode === 'create' ? 'Adicionar Produto' : 'Editar Produto'}
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
            <label htmlFor="prod-name" className={`block text-sm mb-1 ${theme.colors.text.primary}`}>Nome</label>
            <input
              id="prod-name"
              type="text"
              className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${settings.input}`}
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ name: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="prod-desc" className={`block text-sm mb-1 ${theme.colors.text.primary}`}>Descrição</label>
            <textarea
              id="prod-desc"
              rows={5}
              className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${settings.input}`}
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange({ description: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="prod-type" className={`block text-sm mb-1 ${theme.colors.text.primary}`}>Tipo de Produto</label>
            <select
              id="prod-type"
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
              value={productTypeId || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange({ productTypeId: e.target.value })}
              disabled={!!productTypesLoading}
            >
              <option value="" disabled>
                {productTypesLoading ? 'Carregando tipos...' : 'Selecione um tipo de produto'}
              </option>
              {(productTypes || []).map((pt) => (
                <option key={pt.id} value={pt.id}>{pt.description}</option>
              ))}
            </select>
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
