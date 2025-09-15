"use client";

import React from "react";
import { Button } from "@/components/ui/button";

export type StepMessage = {
  id?: string | number;
  conversation_funnel_step_id?: number;
  shipping_time?: string;
  shipping_order?: number;
  message_instruction?: string;
};

export type StepMessagesPanelProps = {
  open: boolean;
  isAdmin?: boolean;
  loading?: boolean;
  isCreating: boolean;
  newShippingTime: string;
  newShippingOrder: number | '';
  newInstruction: string;
  savingNew?: boolean;
  messages: StepMessage[];
  onClose: () => void;
  onStartCreate: () => void;
  onCancelCreate: () => void;
  onSaveCreate: () => void;
  onChangeNew: (fields: Partial<{ shipping_time: string; shipping_order: number | ''; message_instruction: string }>) => void;
  onChangeMessage: (id: string | number, fields: Partial<StepMessage>) => void;
  onBlurMessageField: (id: string | number, fields: Partial<StepMessage>) => void;
};

export default function StepMessagesPanel(props: StepMessagesPanelProps) {
  const {
    open,
    isAdmin,
    loading,
    isCreating,
    newShippingTime,
    newShippingOrder,
    newInstruction,
    savingNew,
    messages,
    onClose,
    onStartCreate,
    onCancelCreate,
    onSaveCreate,
    onChangeNew,
    onChangeMessage,
    onBlurMessageField,
  } = props;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!open}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold dark:text-white">Mensagens da Etapa</h2>
          <button className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white" onClick={onClose} aria-label="Fechar">✕</button>
        </div>
        <div className="p-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm max-h-[75vh] overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                <tr>
                  <th className="text-left px-4 py-2 dark:text-gray-100">Tempo de envio</th>
                  <th className="text-left px-4 py-2 dark:text-gray-100">Ordem de envio</th>
                  <th className="text-left px-4 py-2 dark:text-gray-100">Instruções da Mensagem</th>
                </tr>
              </thead>
              <tbody>
                {isCreating && (
                  <tr className="border-t border-gray-100 dark:border-gray-700 bg-blue-50/40 dark:bg-gray-700/30 align-top">
                    <td className="px-4 py-2 dark:text-gray-100 w-40">
                      <input type="text" className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: 10m, 2h, 1d" value={newShippingTime} onChange={(e) => onChangeNew({ shipping_time: e.target.value })} />
                    </td>
                    <td className="px-4 py-2 dark:text-gray-100 w-40">
                      <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: 1, 2, 3" value={newShippingOrder} onChange={(e) => onChangeNew({ shipping_order: e.target.value === '' ? '' : Number(e.target.value) })} />
                    </td>
                    <td className="px-4 py-2 dark:text-gray-100">
                      <textarea className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[100px]" placeholder="Descreva as instruções da mensagem" value={newInstruction} onChange={(e) => onChangeNew({ message_instruction: e.target.value })} />
                    </td>
                  </tr>
                )}
                {loading ? (
                  <tr><td className="px-4 py-3 dark:text-gray-200" colSpan={3}>Carregando...</td></tr>
                ) : messages.length === 0 ? (
                  <tr><td className="px-4 py-3 dark:text-gray-200" colSpan={3}>Nenhuma mensagem encontrada.</td></tr>
                ) : (
                  messages.map((m) => (
                    <tr key={String(m.id)} className="border-t border-gray-100 dark:border-gray-700 align-top">
                      <td className="px-4 py-2 dark:text-gray-100 w-40">
                        <input type="text" className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" value={m.shipping_time ?? ''} onChange={(e) => onChangeMessage(m.id!, { shipping_time: e.target.value })} onBlur={(e) => onBlurMessageField(m.id!, { shipping_time: e.target.value })} placeholder="Ex: 10m, 2h, 1d" />
                      </td>
                      <td className="px-4 py-2 dark:text-gray-100 w-40">
                        <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" value={m.shipping_order ?? ''} onChange={(e) => onChangeMessage(m.id!, { shipping_order: Number(e.target.value) })} onBlur={(e) => onBlurMessageField(m.id!, { shipping_order: Number(e.target.value) })} placeholder="Ex: 1, 2, 3" />
                      </td>
                      <td className="px-4 py-2 dark:text-gray-100">
                        <textarea className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[100px]" value={m.message_instruction ?? ''} onChange={(e) => onChangeMessage(m.id!, { message_instruction: e.target.value })} onBlur={(e) => onBlurMessageField(m.id!, { message_instruction: e.target.value })} placeholder="Descreva as instruções da mensagem" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {isAdmin && !isCreating && (
            <div className="mt-3 flex justify-end">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white" size="sm" onClick={onStartCreate} title="Incluir mensagem">Incluir mensagem</Button>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-2">
          {isCreating ? (
            <div className="flex items-center gap-2">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white" onClick={onSaveCreate} disabled={!!savingNew} title="Salvar">Salvar</Button>
              <Button variant="secondary" className="bg-gray-700 hover:bg-gray-600 text-white" onClick={onCancelCreate} disabled={!!savingNew}>Cancelar</Button>
            </div>
          ) : <span />}
          <div className="flex items-center gap-2">
            <Button variant="secondary" className="bg-gray-700 hover:bg-gray-600 text-white" onClick={onClose}>Fechar</Button>
          </div>
        </div>
      </div>
    </>
  );
}
