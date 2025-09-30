"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Settings } from "lucide-react";

export type FunnelStep = {
  id: string;
  name?: string;
  description?: string;
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
};

export default function FunnelStepsTab(props: FunnelStepsTabProps) {
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
    onClickEditStep,
    onOpenStepSettings,
    truncate
  } = props;

  return (
    <section className="mt-6 transition-all duration-400 ease-out opacity-100 translate-y-0">
      <div className="flex items-center justify-between">
        <div>
          {funnelName && (
            <p className="text-sm text-gray-600 dark:text-gray-300">{funnelName}</p>
          )}
        </div>
        {isAdmin && !isDefaultFunnel && (
          <Button
            className="bg-blue-600 hover:bg-blue-500 text-white"
            size="sm"
            onClick={onClickIncludeStep}
            title="Incluir etapa"
          >
            + Incluir
          </Button>
        )}
      </div>
      <div className="h-3" />
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm max-h-[50vh] overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
            <tr>
              <th className="text-left px-4 py-2 dark:text-gray-100">Nome</th>
              <th className="text-left px-4 py-2 dark:text-gray-100">Descrição</th>
              <th className="text-right px-4 py-2 dark:text-gray-100">Ações</th>
            </tr>
          </thead>
          <tbody>
            {stepsLoading ? (
              <tr>
                <td className="px-4 py-3 dark:text-gray-200" colSpan={3}>Carregando...</td>
              </tr>
            ) : steps.length === 0 ? (
              <tr>
                <td className="px-4 py-3 dark:text-gray-200" colSpan={3}>Nenhuma etapa encontrada.</td>
              </tr>
            ) : (
              steps
                .slice((stepsPage - 1) * stepsPageSize, (stepsPage - 1) * stepsPageSize + stepsPageSize)
                .map((step) => (
                  <tr key={step.id} className="border-t border-gray-100 dark:border-gray-700">
                    <td className="px-4 py-2 dark:text-gray-100">{truncate(step.name || "", 100)}</td>
                    <td className="px-4 py-2 dark:text-gray-100">{truncate(step.description || "-", 100)}</td>
                    <td className="px-4 py-2 text-right">
                      {isAdmin && (
                        <div className="flex justify-end gap-2">
                          {!isDefaultFunnel && (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="bg-gray-700 hover:bg-gray-600 text-white"
                              title="Editar etapa"
                              onClick={() => onClickEditStep(step)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="secondary"
                            className="bg-gray-700 hover:bg-gray-600 text-white"
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
          <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-gray-700">
            <span className="text-xs dark:text-gray-300">Página {stepsPage} de {Math.ceil(steps.length / stepsPageSize)}</span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="bg-gray-700 hover:bg-gray-600 text-white"
                onClick={onPrevPage}
                disabled={!canPrev}
              >Anterior</Button>
              <Button
                className="bg-blue-600 hover:bg-blue-500 text-white"
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
