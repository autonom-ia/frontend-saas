"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Rocket } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

type StepSuccessProps = {
  onFinish: () => void;
};

export default function StepSuccess({ onFinish }: StepSuccessProps) {
  const { theme } = useTheme();

  return (
    <div className="space-y-8">
      {/* Success Animation */}
      <div className="flex flex-col items-center justify-center py-8">
        <div className="relative">
          <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
          <div className="relative bg-green-600 rounded-full p-6">
            <CheckCircle2 className="h-16 w-16 text-white" />
          </div>
        </div>
        <h2 className={`text-3xl font-bold mt-6 mb-2 ${theme.colors.text.primary}`}>Configuração Concluída!</h2>
        <p className={`text-center max-w-md ${theme.colors.text.muted}`}>
          Sua conta WhatsApp foi configurada com sucesso e está pronta para uso. 
          Agora você pode começar a automatizar suas comunicações via WhatsApp.
        </p>
      </div>

      {/* Summary Card */}
      <Card className={`${theme.colors.background.card} ${theme.colors.border.primary}`}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="bg-green-600 rounded-lg p-3">
              <Rocket className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-semibold mb-2 ${theme.colors.text.primary}`}>
                Tudo Pronto para Começar!
              </h3>
              <p className={`text-sm mb-4 ${theme.colors.text.secondary}`}>
                Sua conta está ativa e conectada. Você já pode começar a explorar todos os recursos da plataforma.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-green-600/20 text-green-400 text-xs px-3 py-1 rounded-full border border-green-600/30">
                  ✓ Produto Selecionado
                </span>
                <span className="bg-green-600/20 text-green-400 text-xs px-3 py-1 rounded-full border border-green-600/30">
                  ✓ Conta Criada
                </span>
                <span className="bg-green-600/20 text-green-400 text-xs px-3 py-1 rounded-full border border-green-600/30">
                  ✓ WhatsApp Conectado
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Action Button */}
      <div className="flex justify-center pt-6">
        <Button
          onClick={onFinish}
          className={`${theme.colors.button.primary} px-12 py-3 text-lg`}
        >
          <Rocket className="h-5 w-5 mr-2" />
          Começar a Usar
        </Button>
      </div>
    </div>
  );
}
