"use client";

import { Check } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

type StepBreadcrumbProps = {
  currentStep: number;
  totalSteps: number;
};

const stepLabels = [
  "Selecionar Produto",
  "Adicionar Conta",
  "Conectar WhatsApp",
  "Concluído"
];

export default function StepBreadcrumb({ currentStep, totalSteps }: StepBreadcrumbProps) {
  const { theme } = useTheme();
  
  return (
    <nav aria-label="Progresso da configuração" className="w-full max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="relative mb-8">
        {/* Background Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-300">
          {/* Active Progress Line */}
          <div
            className="h-full bg-green-600 transition-all duration-500 ease-out"
            style={{
              width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep || (stepNumber === totalSteps && currentStep === totalSteps);
            const isCurrent = stepNumber === currentStep;

            return (
              <div key={stepNumber} className="flex flex-col items-center" style={{ width: '120px' }}>
                {/* Circle */}
                <div
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                    ${isCompleted ? "bg-green-600 border-green-600" : ""}
                    ${isCurrent ? "bg-blue-600 border-blue-600 ring-4 ring-blue-600/30" : ""}
                    ${!isCompleted && !isCurrent ? "bg-white border-gray-300" : ""}
                  `}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5 text-white" />
                  ) : (
                    <span
                      className={`text-sm font-semibold ${
                        isCurrent ? "text-white" : "text-gray-500"
                      }`}
                    >
                      {stepNumber}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={`mt-3 text-xs text-center leading-tight transition-colors duration-300 ${
                    isCurrent ? "text-gray-900 font-semibold" : "text-gray-500"
                  }`}
                  style={{ 
                    width: '100px',
                    whiteSpace: 'normal',
                    wordBreak: 'keep-all',
                    overflowWrap: 'break-word'
                  }}
                >
                  {stepLabels[index]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
