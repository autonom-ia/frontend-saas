"use client";

import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";

export type StepFormProps = {
  open: boolean;
  mode: "create" | "edit";
  name: string;
  description: string;
  agentInstruction: string;
  saving?: boolean;
  onClose: () => void;
  onChange: (fields: Partial<{ name: string; description: string; agentInstruction: string }>) => void;
  onSave: () => void;
  titleCreate?: string;
  titleEdit?: string;
};

export default function StepForm({ open, mode, name, description, agentInstruction, saving, onClose, onChange, onSave, titleCreate = 'Nova Etapa do Funil', titleEdit = 'Editar Etapa do Funil' }: StepFormProps) {
  const { theme } = useTheme();
  const settings = theme.colors.settings;
  
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md shadow-xl z-50 transform transition-transform duration-300 ease-out ${settings.form} ${open ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!open}
      >
        <div className={`p-4 border-b flex items-center justify-between ${settings.formBorder}`}>
          <h2 className={`text-lg font-semibold ${theme.colors.text.primary}`}>{mode === 'create' ? titleCreate : titleEdit}</h2>
          <button className={`${theme.colors.text.muted} ${theme.colors.background.hover}`} onClick={onClose} aria-label="Fechar">✕</button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label htmlFor="step-name" className={`block text-sm mb-1 ${theme.colors.text.primary}`}>Nome</label>
            <input id="step-name" type="text" className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${settings.input}`} value={name} onChange={(e) => onChange({ name: e.target.value })} />
          </div>
          <div>
            <label htmlFor="step-desc" className={`block text-sm mb-1 ${theme.colors.text.primary}`}>Descrição</label>
            <textarea id="step-desc" className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[100px] ${settings.input}`} value={description} onChange={(e) => onChange({ description: e.target.value })} />
          </div>
          <div>
            <label htmlFor="step-agent-instruction" className={`block text-sm mb-1 ${theme.colors.text.primary}`}>Instrução do Agente <span className="text-red-600">*</span></label>
            <textarea
              id="step-agent-instruction"
              required
              className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[120px] ${settings.input}`}
              value={agentInstruction}
              onChange={(e) => onChange({ agentInstruction: e.target.value })}
              placeholder="Descreva a instrução que o agente deve seguir nesta etapa"
            />
          </div>
        </div>
        <div className={`p-4 border-t flex items-center justify-end gap-2 ${settings.formBorder}`}>
          <Button variant="secondary" className={theme.colors.button.secondary} onClick={onClose}>Fechar</Button>
          <Button className={theme.colors.button.primary} disabled={!!saving} onClick={onSave}>Salvar</Button>
        </div>
      </div>
    </>
  );
}
