"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import StepBreadcrumb from "@/components/onboarding/StepBreadcrumb";
import StepSelectProduct from "@/components/onboarding/StepSelectProduct";
import StepConfigureAccount from "@/components/onboarding/StepConfigureAccount";
import StepConnectWhatsApp from "@/components/onboarding/StepConnectWhatsApp";
import StepSuccess from "@/components/onboarding/StepSuccess";

const TOTAL_STEPS = 4;

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [accountData, setAccountData] = useState<Record<string, string> | null>(null);
  const [qrCode] = useState<string>("");

  // Inicializar com query params se existirem
  useEffect(() => {
    const productParam = searchParams.get('product');
    const stepParam = searchParams.get('step');
    
    if (productParam) {
      setSelectedProduct(productParam);
    }
    
    if (stepParam) {
      const step = parseInt(stepParam, 10);
      if (step >= 1 && step <= TOTAL_STEPS) {
        setCurrentStep(step);
      }
    }
  }, [searchParams]);

  const handleNextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProduct(productId);
    handleNextStep();
  };

  const handleAccountAdd = (data: Record<string, string>) => {
    setAccountData(data);
    handleNextStep();
  };

  const handleWhatsAppConnect = () => {
    handleNextStep();
  };

  const handleFinish = () => {
    // Se veio de settings (via query param), redirecionar de volta para settings
    const returnTo = searchParams.get('returnTo');
    if (returnTo === 'settings') {
      router.push('/settings');
    } else {
      // Caso contrário, ir para monitoring (fluxo onboarding completo)
      router.push('/monitoring');
    }
  };

  const handleCancel = () => {
    router.push("/campaigns");
  };

  return (
    <div className={`min-h-screen ${theme.colors.background.primary}`}>
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 flex items-center h-16 ${theme.colors.background.secondary} backdrop-blur-sm border-b ${theme.colors.border.primary} px-6`}>
        <div className="flex items-center gap-4">
          <Image 
            src={theme.logoSquare} 
            alt="Logo" 
            width={42} 
            height={42} 
            priority
            onError={(e) => {
              e.currentTarget.src = '/images/logo.png';
            }}
          />
          <div>
            <h1 className={`text-lg font-semibold ${theme.colors.text.primary}`}>Configuração Inicial</h1>
            <p className={`text-xs ${theme.colors.text.muted}`}>Configure sua conta WhatsApp para começar</p>
          </div>
        </div>
        {currentStep > 1 && currentStep < TOTAL_STEPS && (
          <Button
            variant="ghost"
            onClick={handlePreviousStep}
            className={`ml-auto ${theme.colors.button.ghost}`}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <StepBreadcrumb currentStep={currentStep} totalSteps={TOTAL_STEPS} />

          {/* Step Content */}
          <div className="mt-8">
            {currentStep === 1 && <StepSelectProduct onNext={handleProductSelect} onCancel={handleCancel} />}
            {currentStep === 2 && selectedProduct && (
              <StepConfigureAccount 
                productId={selectedProduct} 
                onNext={handleAccountAdd}
                onBack={handlePreviousStep}
              />
            )}
            {currentStep === 3 && accountData?.accountId && accountData?.accountPhone && (
              <StepConnectWhatsApp 
                accountId={accountData.accountId}
                accountPhone={accountData.accountPhone}
                onNext={handleWhatsAppConnect}
              />
            )}
            {currentStep === 4 && <StepSuccess onFinish={handleFinish} />}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}
