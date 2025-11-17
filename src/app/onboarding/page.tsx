"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import StepBreadcrumb from "@/components/onboarding/StepBreadcrumb";
import StepSelectProduct from "@/components/onboarding/StepSelectProduct";
import StepConfigureAccount from "@/components/onboarding/StepConfigureAccount";
import StepConnectWhatsApp from "@/components/onboarding/StepConnectWhatsApp";
import StepSuccess from "@/components/onboarding/StepSuccess";

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [accountData, setAccountData] = useState<Record<string, any> | null>(null);
  const [qrCode, setQrCode] = useState<string>("");

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

  const handleAccountAdd = (data: Record<string, any>) => {
    setAccountData(data);
    handleNextStep();
  };

  const handleWhatsAppConnect = () => {
    handleNextStep();
  };

  const handleFinish = () => {
    // Redirect to main application
    router.push("/campaigns");
  };

  const handleCancel = () => {
    router.push("/campaigns");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center h-16 bg-gray-800/95 backdrop-blur-sm border-b border-gray-700 px-6">
        <div className="flex items-center gap-4">
          <Image src="/images/logo.png" alt="Autonom.ia Logo" width={42} height={42} priority />
          <div>
            <h1 className="text-white text-lg font-semibold">Configuração Inicial</h1>
            <p className="text-gray-400 text-xs">Configure sua conta WhatsApp para começar</p>
          </div>
        </div>
        {currentStep > 1 && currentStep < TOTAL_STEPS && (
          <Button
            variant="ghost"
            onClick={handlePreviousStep}
            className="ml-auto text-gray-300 hover:text-white"
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
