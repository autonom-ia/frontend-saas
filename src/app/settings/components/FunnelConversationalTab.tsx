"use client";

import React from "react";

export type Step = { id?: string; name?: string; description?: string };

type FunnelConversationalTabProps = {
  steps: Step[];
  stepsLoading: boolean;
  stepsPage: number;
  stepsPageSize: number;
  setStepsPage: React.Dispatch<React.SetStateAction<number>>;
  userIsAdmin: boolean;
  selectedAccountFunnelIsDefault: boolean;
  selectedAccountFunnelName?: string;
  onClickIncludeStep: () => void;
  truncate: (text: string, max?: number) => string;
};

export default function FunnelConversationalTab(props: FunnelConversationalTabProps) {
  const {
    steps,
    stepsLoading,
    stepsPage,
    stepsPageSize,
    setStepsPage,
    userIsAdmin,
    selectedAccountFunnelIsDefault,
    selectedAccountFunnelName,
    onClickIncludeStep,
    truncate,
  } = props;

  return (
    <section className={`mt-4 transition-all duration-400 ease-out opacity-100 translate-y-0`}>
      <div className="flex items-center justify-between">
        <div>
          {selectedAccountFunnelName && (
            <p className="text-sm text-gray-600 dark:text-gray-300">{selectedAccountFunnelName}</p>
          )}
        </div>
        {userIsAdmin && !selectedAccountFunnelIsDefault && (
          <button
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm rounded px-3 py-2"
            onClick={onClickIncludeStep}
            title="Incluir etapa"
          >
            Incluir
          </button>
        )}
      </div>
      <div className="h-3" />
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm max-h-[50vh] overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
            <tr>
              <th className="text-left px-4 py-2 dark:text-gray-100">Nome</th>
              <th className="text-left px-4 py-2 dark:text-gray-100">Descrição</th>
            </tr>
          </thead>
          <tbody>
            {stepsLoading ? (
              <tr><td className="px-4 py-3 dark:text-gray-200" colSpan={2}>Carregando...</td></tr>
            ) : steps.length === 0 ? (
              <tr><td className="px-4 py-3 dark:text-gray-200" colSpan={2}>Nenhuma etapa encontrada.</td></tr>
            ) : (
              steps
                .slice((stepsPage - 1) * stepsPageSize, (stepsPage - 1) * stepsPageSize + stepsPageSize)
                .map((step) => (
                  <tr key={step.id} className="border-t border-gray-100 dark:border-gray-700">
                    <td className="px-4 py-2 dark:text-gray-100">{truncate(step.name || "", 100)}</td>
                    <td className="px-4 py-2 dark:text-gray-100">{truncate(step.description || "-", 100)}</td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
        {steps.length > stepsPageSize && (
          <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-gray-700">
            <span className="text-xs dark:text-gray-300">Página {stepsPage} de {Math.ceil(steps.length / stepsPageSize)}</span>
            <div className="flex gap-2">
              <button
                className="bg-gray-700 hover:bg-gray-600 text-white text-sm rounded px-3 py-1.5 disabled:opacity-50"
                onClick={() => setStepsPage(p => Math.max(1, (typeof p === 'number' ? p : 1) - 1))}
                disabled={stepsPage === 1}
              >Anterior</button>
              <button
                className="bg-blue-600 hover:bg-blue-500 text-white text-sm rounded px-3 py-1.5 disabled:opacity-50"
                onClick={() => setStepsPage(p => Math.min(Math.ceil(steps.length / stepsPageSize), (typeof p === 'number' ? p : 1) + 1))}
                disabled={stepsPage >= Math.ceil(steps.length / stepsPageSize)}
              >Próxima</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
