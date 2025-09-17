"use client";

import React from "react";
import { Button } from "@/components/ui/button";

export type AccountParameter = { id: string; name: string; value?: string };

export type AccountParametersPanelProps = {
  open: boolean;
  isAdmin?: boolean;
  loading?: boolean;
  items: AccountParameter[];
  isCreating: boolean;
  newName: string;
  newValue: string;
  savingNew?: boolean;
  onClose: () => void;
  onStartCreate: () => void;
  onCancelCreate: () => void;
  onSaveCreate: () => void;
  onChangeNewName: (v: string) => void;
  onChangeNewValue: (v: string) => void;
  onChangeItemValue: (id: string, v: string) => void;
  onBlurItemSave: (id: string, v: string) => void;
};

export default function AccountParametersPanel(props: AccountParametersPanelProps) {
  const {
    open,
    isAdmin,
    loading,
    items,
    isCreating,
    newName,
    newValue,
    savingNew,
    onClose,
    onStartCreate,
    onCancelCreate,
    onSaveCreate,
    onChangeNewName,
    onChangeNewValue,
    onChangeItemValue,
    onBlurItemSave,
  } = props;

  return (
    <div
      className={`fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      aria-hidden={!open}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold dark:text-white">Parâmetros da Conta</h2>
        <button
          className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
          onClick={onClose}
          aria-label="Fechar"
        >
          ✕
        </button>
      </div>
      <div className="p-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm max-h-[75vh] overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
              <tr>
                <th className="text-left px-4 py-2 dark:text-gray-100">Nome</th>
                <th className="text-left px-4 py-2 dark:text-gray-100">Valor</th>
              </tr>
            </thead>
            <tbody>
              {isCreating && (
                <tr className="border-t border-gray-100 dark:border-gray-700 bg-blue-50/40 dark:bg-gray-700/30">
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nome do parâmetro"
                      value={newName}
                      onChange={(e) => onChangeNewName(e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Valor"
                      value={newValue}
                      onChange={(e) => onChangeNewValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') onSaveCreate(); }}
                    />
                  </td>
                </tr>
              )}
              {loading ? (
                <tr><td className="px-4 py-3 dark:text-gray-200" colSpan={2}>Carregando...</td></tr>
              ) : items.length === 0 ? (
                <tr><td className="px-4 py-3 dark:text-gray-200" colSpan={2}>Nenhum parâmetro encontrado.</td></tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} className="border-t border-gray-100 dark:border-gray-700">
                    <td className="px-4 py-2 dark:text-gray-100">{item.name}</td>
                    <td className="px-4 py-2 dark:text-gray-100">
                      {((item.value ?? '').length > 60) ? (
                        <textarea
                          className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[80px]"
                          rows={Math.min(8, Math.max(3, Math.ceil(((item.value ?? '').length) / 60)))}
                          value={item.value ?? ''}
                          onChange={(e) => onChangeItemValue(item.id, e.target.value)}
                          onBlur={(e) => onBlurItemSave(item.id, e.target.value)}
                          placeholder="Defina o valor"
                        />
                      ) : (
                        <input
                          type="text"
                          className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={item.value ?? ''}
                          onChange={(e) => onChangeItemValue(item.id, e.target.value)}
                          onBlur={(e) => onBlurItemSave(item.id, e.target.value)}
                          placeholder="Defina o valor"
                        />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Removed top-right '+ Incluir' button to avoid duplication with footer action */}
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-2">
        {isCreating ? (
          <div className="flex items-center gap-2">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white" onClick={onSaveCreate} disabled={!!savingNew} title="Salvar parâmetro">Salvar</Button>
            <Button variant="secondary" className="bg-gray-700 hover:bg-gray-600 text-white" onClick={onCancelCreate} disabled={!!savingNew}>Cancelar</Button>
          </div>
        ) : <span />}
        <div className="flex items-center gap-2">
          {!isCreating && isAdmin && (
            <Button className="bg-blue-600 hover:bg-blue-500 text-white" size="sm" onClick={onStartCreate} title="Incluir parâmetro">Incluir nos parâmetros</Button>
          )}
          <Button variant="secondary" className="bg-gray-700 hover:bg-gray-600 text-white" onClick={onClose}>Fechar</Button>
        </div>
      </div>
    </div>
  );
}
