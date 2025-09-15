"use client";

import { Button } from "@/components/ui/button";
import React from "react";

export type ProductFormProps = {
  open: boolean;
  mode: "create" | "edit";
  name: string;
  description: string;
  saving?: boolean;
  onChange: (fields: Partial<{ name: string; description: string }>) => void;
  onSave: () => void;
  onClose: () => void;
};

export default function ProductForm(props: ProductFormProps) {
  const { open, mode, name, description, saving, onChange, onSave, onClose } = props;

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
            {mode === 'create' ? 'Adicionar Produto' : 'Editar Produto'}
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
            <label htmlFor="prod-name" className="block text-sm mb-1 dark:text-gray-200">Nome</label>
            <input
              id="prod-name"
              type="text"
              className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={(e) => onChange({ name: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="prod-desc" className="block text-sm mb-1 dark:text-gray-200">Descrição</label>
            <textarea
              id="prod-desc"
              rows={5}
              className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={description}
              onChange={(e) => onChange({ description: e.target.value })}
            />
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
