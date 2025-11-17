"use client";

import React, { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Pencil, Settings } from "lucide-react";

export type FunnelStep = {
  id: string;
  name?: string;
  description?: string;
  agent_instruction?: string;
  order?: number;
};

export type FunnelStepsTabProps = {
  funnelName?: string;
  isAdmin: boolean;
  isDefaultFunnel: boolean;
  steps: FunnelStep[];
  stepsLoading: boolean;
  stepsPage: number;
  stepsPageSize: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  canPrev: boolean;
  canNext: boolean;
  onClickIncludeStep: () => void;
  onClickEditStep: (step: FunnelStep) => void;
  onOpenStepSettings: (stepId: string) => void;
  truncate: (text: string, max?: number) => string;
  onClickEditFunnel: () => void;
  onUpdateStepOrder: (stepId: string, order: number | null) => Promise<void>;
};

export default function FunnelStepsTab(props: FunnelStepsTabProps) {
  const { theme } = useTheme();
  const settings = theme.colors.settings;
  const {
    funnelName,
    isAdmin,
    isDefaultFunnel,
    steps,
    stepsLoading,
    stepsPage,
    stepsPageSize,
    onPrevPage,
    onNextPage,
    canPrev,
    canNext,
    onClickIncludeStep,
    onClickEditFunnel,
    onClickEditStep,
    onOpenStepSettings,
    truncate,
    onUpdateStepOrder
  } = props;

  // Local state for editing order values
  const [editingOrders, setEditingOrders] = useState<Record<string, number | null>>({});

  return (
    <section className="mt-6 transition-all duration-400 ease-out opacity-100 translate-y-0">
      <div className="flex items-center justify-between">
        <div>
          {funnelName && (
            <p className={`text-sm ${theme.colors.text.secondary}`}>{funnelName}</p>
          )}
        </div>
        {isAdmin && !isDefaultFunnel && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className={theme.colors.button.secondary}
              onClick={onClickEditFunnel}
              title="Editar funil"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              className={theme.colors.button.primary}
              size="sm"
              onClick={onClickIncludeStep}
              title="Incluir etapa"
            >
              + Incluir
            </Button>
          </div>
        )}
      </div>
      <div className="h-3" />
      <div className={`border rounded shadow-sm max-h-[50vh] overflow-auto ${settings.table}`}>
        <table className="min-w-full text-sm">
          <thead className={`sticky top-0 ${settings.tableHeader}`}>
            <tr>
              <th className={`text-left px-4 py-2 ${theme.colors.text.primary}`}>Ordem</th>
              <th className={`text-left px-4 py-2 ${theme.colors.text.primary}`}>Nome</th>
              <th className={`text-left px-4 py-2 ${theme.colors.text.primary}`}>Descrição</th>
              <th className={`text-right px-4 py-2 ${theme.colors.text.primary}`}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {stepsLoading ? (
              <tr>
                <td className={`px-4 py-3 ${theme.colors.text.primary}`} colSpan={4}>Carregando...</td>
              </tr>
            ) : steps.length === 0 ? (
              <tr>
                <td className={`px-4 py-3 ${theme.colors.text.primary}`} colSpan={4}>Nenhuma etapa encontrada.</td>
              </tr>
            ) : (
              steps
                .slice((stepsPage - 1) * stepsPageSize, (stepsPage - 1) * stepsPageSize + stepsPageSize)
                .map((step) => (
                  <tr key={step.id} className={`border-t ${settings.tableRow}`}>
                    <td className={`px-4 py-2 ${theme.colors.text.primary}`}>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        className={`w-20 px-2 py-1 border rounded ${settings.input}`}
                        value={editingOrders[step.id] !== undefined ? (editingOrders[step.id] ?? '') : (step.order ?? '')}
                        onChange={(e) => {
                          const newOrder = e.target.value === '' ? null : parseInt(e.target.value, 10);
                          setEditingOrders(prev => ({ ...prev, [step.id]: newOrder }));
                        }}
                        onBlur={async (e) => {
                          const newOrder = e.target.value === '' ? null : parseInt(e.target.value, 10);
                          if (newOrder !== step.order) {
                            await onUpdateStepOrder(step.id, newOrder);
                          }
                          // Clear editing state
                          setEditingOrders(prev => {
                            const updated = { ...prev };
                            delete updated[step.id];
                            return updated;
                          });
                        }}
                        disabled={!isAdmin || isDefaultFunnel}
                      />
                    </td>
                    <td className={`px-4 py-2 ${theme.colors.text.primary}`}>{truncate(step.name || "", 100)}</td>
                    <td className={`px-4 py-2 ${theme.colors.text.primary}`}>{truncate(step.description || "-", 100)}</td>
                    <td className="px-4 py-2 text-right">
                      {isAdmin && (
                        <div className="flex justify-end gap-2">
                          {!isDefaultFunnel && (
                            <Button
                              size="sm"
                              variant="secondary"
                              className={theme.colors.button.secondary}
                              title="Editar etapa"
                              onClick={() => onClickEditStep(step)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="secondary"
                            className={theme.colors.button.secondary}
                            title="Configurações da etapa"
                            onClick={() => onOpenStepSettings(step.id)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
        {steps.length > stepsPageSize && (
          <div className={`flex items-center justify-between px-4 py-2 border-t ${settings.tableBorder}`}>
            <span className={`text-xs ${theme.colors.text.secondary}`}>Página {stepsPage} de {Math.ceil(steps.length / stepsPageSize)}</span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className={theme.colors.button.secondary}
                onClick={onPrevPage}
                disabled={!canPrev}
              >Anterior</Button>
              <Button
                className={theme.colors.button.primary}
                onClick={onNextPage}
                disabled={!canNext}
              >Próxima</Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
