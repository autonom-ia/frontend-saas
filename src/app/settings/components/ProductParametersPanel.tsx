"use client";

import React, { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

export type ProductParameter = { 
  id: string; 
  name: string; 
  value?: string;
  short_description?: string | null;
  help_text?: string | null;
};

export type ProductParametersPanelProps = {
  open: boolean;
  isAdmin?: boolean;
  loading?: boolean;
  items: ProductParameter[];
  isCreating: boolean;
  newName: string;
  newShortDescription: string;
  newHelpText: string;
  newValue: string;
  savingNew?: boolean;
  unsavedCount: number;
  savingBulk?: boolean;
  onClose: () => void;
  onStartCreate: () => void;
  onCancelCreate: () => void;
  onSaveCreate: () => void;
  onSaveBulk: () => void;
  onCancelBulk: () => void;
  onChangeNewName: (v: string) => void;
  onChangeNewShortDescription: (v: string) => void;
  onChangeNewHelpText: (v: string) => void;
  onChangeNewValue: (v: string) => void;
  onChangeItemValue: (id: string, v: string) => void;
};

export default function ProductParametersPanel(props: ProductParametersPanelProps) {
  const { theme } = useTheme();
  const settings = theme.colors.settings;
  const [showHelpId, setShowHelpId] = useState<string | null>(null);
  
  const {
    open,
    isAdmin,
    loading,
    items,
    isCreating,
    newName,
    newShortDescription,
    newHelpText,
    newValue,
    savingNew,
    onClose,
    onStartCreate,
    onCancelCreate,
    onSaveCreate,
    unsavedCount,
    savingBulk,
    onCancelBulk,
    onChangeNewName,
    onChangeNewShortDescription,
    onChangeNewHelpText,
    onChangeNewValue,
    onChangeItemValue,
    onSaveBulk,
  } = props;

  return (
    <div
      className={`fixed right-0 top-0 h-full w-full max-w-md shadow-xl z-50 transform transition-transform duration-300 ease-out ${settings.form} ${open ? 'translate-x-0' : 'translate-x-full'}`}
      aria-hidden={!open}
    >
      <div className={`p-4 border-b flex items-center justify-between ${settings.formBorder}`}>
        <h2 className={`text-lg font-semibold ${theme.colors.text.primary}`}>Parâmetros do Produto</h2>
        <button
          className={`${theme.colors.text.muted} ${theme.colors.background.hover}`}
          onClick={onClose}
          aria-label="Fechar"
        >
          ✕
        </button>
      </div>
      <div className="p-4">
        <div className={`border rounded shadow-sm max-h-[75vh] overflow-auto ${settings.table}`}>
          <table className="min-w-full text-sm">
            <thead className={`sticky top-0 ${settings.tableHeader}`}>
              <tr>
                <th className={`text-left px-4 py-2 ${theme.colors.text.primary}`}>Parâmetro</th>
                <th className={`text-left px-4 py-2 ${theme.colors.text.primary}`}>Valor</th>
              </tr>
            </thead>
            <tbody>
              {isCreating && (
                <tr className={`border-t ${settings.tableRow} ${settings.tableRowSelected}`}>
                  <td className="px-4 py-2">
                    <div className="space-y-2">
                      <input
                        type="text"
                        className={`w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${settings.input}`}
                        placeholder="Label (ex: Chave API)"
                        value={newShortDescription}
                        onChange={(e) => onChangeNewShortDescription(e.target.value)}
                      />
                      <input
                        type="text"
                        className={`w-full rounded border px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 ${settings.input}`}
                        placeholder="Código (ex: api-key)"
                        value={newName}
                        onChange={(e) => onChangeNewName(e.target.value)}
                      />
                      <textarea
                        className={`w-full rounded border px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[60px] ${settings.input}`}
                        placeholder="Texto de ajuda"
                        value={newHelpText}
                        onChange={(e) => onChangeNewHelpText(e.target.value)}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      className={`w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${settings.input}`}
                      placeholder="Valor"
                      value={newValue}
                      onChange={(e) => onChangeNewValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') onSaveCreate(); }}
                    />
                  </td>
                </tr>
              )}
              {loading ? (
                <tr><td className={`px-4 py-3 ${theme.colors.text.primary}`} colSpan={2}>Carregando...</td></tr>
              ) : items.length === 0 ? (
                <tr><td className={`px-4 py-3 ${theme.colors.text.primary}`} colSpan={2}>Nenhum parâmetro encontrado.</td></tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} className={`border-t ${settings.tableRow}`}>
                    <td className="px-4 py-2">
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          <div className={`text-sm font-medium ${theme.colors.text.primary}`}>
                            {item.short_description || item.name}
                          </div>
                          <div className={`text-[10px] ${theme.colors.text.muted} mt-0.5`}>
                            {item.name}
                          </div>
                        </div>
                        {item.help_text && (
                          <div className="relative">
                            <button
                              type="button"
                              className={`mt-0.5 ${theme.colors.text.muted} hover:${theme.colors.text.primary} transition-colors`}
                              onClick={() => setShowHelpId(showHelpId === item.id ? null : item.id)}
                              title="Ajuda"
                            >
                              <HelpCircle className="h-4 w-4" />
                            </button>
                            {showHelpId === item.id && (
                              <>
                                <div className="fixed inset-0 z-[100]" onClick={() => setShowHelpId(null)} />
                                <div className={`absolute left-1/2 -translate-x-1/2 top-full mt-2 z-[101] w-80 max-w-[90vw] p-4 rounded-lg shadow-2xl border ${settings.form} ${settings.formBorder}`}>
                                  <div className={`text-sm leading-relaxed ${theme.colors.text.primary}`}>{item.help_text}</div>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className={`px-4 py-2 ${theme.colors.text.primary}`}>
                      {((item.value ?? '').length > 60) ? (
                        <textarea
                          className={`w-full rounded border px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[80px] ${settings.input}`}
                          rows={Math.min(8, Math.max(3, Math.ceil(((item.value ?? '').length) / 60)))}
                          value={item.value ?? ''}
                          onChange={(e) => onChangeItemValue(item.id, e.target.value)}
                          placeholder="Defina o valor"
                        />
                      ) : (
                        <input
                          type="text"
                          className={`w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${settings.input}`}
                          value={item.value ?? ''}
                          onChange={(e) => onChangeItemValue(item.id, e.target.value)}
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
      </div>
      <div className={`p-4 border-t flex flex-col gap-3 ${settings.formBorder}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {isAdmin && unsavedCount > 0 && (
              <Button
                className={theme.colors.button.primary}
                onClick={onSaveBulk}
                disabled={!!savingBulk}
                title="Salvar alterações nos parâmetros"
              >
                {savingBulk ? 'Salvando...' : `Salvar ${unsavedCount} alteração${unsavedCount > 1 ? 'es' : ''}`}
              </Button>
            )}
            {isAdmin && unsavedCount > 0 && (
              <Button
                variant="secondary"
                className={theme.colors.button.secondary}
                onClick={onCancelBulk}
                disabled={!!savingBulk}
                title="Cancelar alterações"
              >
                Cancelar
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isCreating && isAdmin && unsavedCount === 0 && (
              <Button className={theme.colors.button.primary} size="sm" onClick={onStartCreate} title="Incluir parâmetro">Incluir nos parâmetros</Button>
            )}
            {unsavedCount === 0 && (
              <Button variant="secondary" className={theme.colors.button.secondary} onClick={onClose}>Fechar</Button>
            )}
          </div>
        </div>
        {isCreating && (
          <div className="flex items-center gap-2">
            <Button className={theme.colors.button.primary} onClick={onSaveCreate} disabled={!!savingNew} title="Salvar parâmetro">Salvar parâmetro</Button>
            <Button variant="secondary" className={theme.colors.button.secondary} onClick={onCancelCreate} disabled={!!savingNew}>Cancelar</Button>
          </div>
        )}
      </div>
    </div>
  );
}
