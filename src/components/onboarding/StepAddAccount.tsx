"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Building2, Info, User, FileText } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

type StepAddAccountProps = {
  onNext: (data: {
    accountName: string;
    phoneNumber: string;
    agentName: string;
    companyDescription: string;
    welcomeMessage: string;
  }) => void;
};

export default function StepAddAccount({ onNext }: StepAddAccountProps) {
  const [accountName, setAccountName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [agentName, setAgentName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [errors, setErrors] = useState<{ 
    name?: string; 
    phone?: string;
    agentName?: string;
    companyDescription?: string;
    welcomeMessage?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: { 
      name?: string; 
      phone?: string;
      agentName?: string;
      companyDescription?: string;
      welcomeMessage?: string;
    } = {};

    if (!accountName.trim()) {
      newErrors.name = "Nome da conta é obrigatório";
    }

    if (!phoneNumber.trim()) {
      newErrors.phone = "Número de telefone é obrigatório";
    } else if (!/^\d{10,15}$/.test(phoneNumber.replace(/\D/g, ""))) {
      newErrors.phone = "Número de telefone inválido (use apenas números, 10-15 dígitos)";
    }

    if (!agentName.trim()) {
      newErrors.agentName = "Nome do agente é obrigatório";
    }

    if (!companyDescription.trim()) {
      newErrors.companyDescription = "Descrição da empresa é obrigatória";
    } else if (companyDescription.trim().length < 20) {
      newErrors.companyDescription = "Descrição muito curta (mínimo 20 caracteres)";
    }

    if (!welcomeMessage.trim()) {
      newErrors.welcomeMessage = "Mensagem de boas-vindas é obrigatória";
    } else if (welcomeMessage.trim().length < 10) {
      newErrors.welcomeMessage = "Mensagem muito curta (mínimo 10 caracteres)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      onNext({
        accountName,
        phoneNumber,
        agentName,
        companyDescription,
        welcomeMessage
      });
    }
  };

  const handlePhoneChange = (value: string) => {
    // Remove non-numeric characters
    const cleaned = value.replace(/\D/g, "");
    setPhoneNumber(cleaned);
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
        <h2 className="text-white text-lg font-semibold mb-2 flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Adicionar Conta WhatsApp
        </h2>
        <p className="text-gray-300 text-sm">
          Configure sua primeira conta WhatsApp para começar a usar o WhatsApp Business. 
          Você precisará de um número de telefone válido que não esteja em uso em outro WhatsApp.
        </p>
      </div>

      {/* Form Card */}
      <Card className="bg-gray-800/60 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Informações da Conta</CardTitle>
          <CardDescription className="text-gray-400">
            Preencha os dados para criar sua conta WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Account Name */}
          <div className="space-y-2">
            <Label htmlFor="accountName" className="text-white">
              Nome da Conta *
            </Label>
            <Input
              id="accountName"
              type="text"
              placeholder="Ex: Atendimento Principal"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className={`bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500 ${
                errors.name ? "border-red-500" : ""
              }`}
            />
            {errors.name && (
              <p className="text-red-400 text-sm">{errors.name}</p>
            )}
            <p className="text-gray-400 text-xs">
              Escolha um nome descritivo para identificar esta conta
            </p>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-white flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Número de Telefone *
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="Ex: 5511999999999"
              value={phoneNumber}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className={`bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500 ${
                errors.phone ? "border-red-500" : ""
              }`}
            />
            {errors.phone && (
              <p className="text-red-400 text-sm">{errors.phone}</p>
            )}
            <p className="text-gray-400 text-xs">
              Formato: Código do país + DDD + Número (apenas números, sem espaços ou símbolos)
            </p>
            
            {/* Exclusive Number Warning */}
            <div className="bg-orange-900/20 border-2 border-orange-600/50 rounded-lg p-3 flex gap-3 mt-3">
              <Info className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-orange-200 text-sm font-semibold">⚠️ Número Exclusivo do Agente</p>
                <p className="text-orange-200/90 text-xs mt-1">
                  Este número deve ser dedicado exclusivamente ao atendimento virtual. 
                  <strong className="text-orange-100"> NÃO use seu número pessoal ou um número já vinculado a outro WhatsApp.</strong> 
                  Recomendamos adquirir um chip novo e exclusivo para o agente.
                </p>
              </div>
            </div>
          </div>

          {/* Agent Name */}
          <div className="space-y-2">
            <Label htmlFor="agentName" className="text-white flex items-center gap-2">
              <User className="h-4 w-4" />
              Nome do Agente *
            </Label>
            <Input
              id="agentName"
              type="text"
              placeholder="Ex: Maria Assistente"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              className={`bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500 ${
                errors.agentName ? "border-red-500" : ""
              }`}
            />
            {errors.agentName && (
              <p className="text-red-400 text-sm">{errors.agentName}</p>
            )}
            <p className="text-gray-400 text-xs">
              Nome que será usado pelo assistente virtual nas conversas
            </p>
          </div>

          {/* Company Description */}
          <div className="space-y-2">
            <Label htmlFor="companyDescription" className="text-white flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Descrição da Empresa *
            </Label>
            <Textarea
              id="companyDescription"
              placeholder="Ex: Somos uma empresa de tecnologia focada em soluções de automação para WhatsApp..."
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
              rows={3}
              className={`bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500 resize-none ${
                errors.companyDescription ? "border-red-500" : ""
              }`}
            />
            {errors.companyDescription && (
              <p className="text-red-400 text-sm">{errors.companyDescription}</p>
            )}
            <p className="text-gray-400 text-xs">
              Descreva sua empresa e o que ela faz (mínimo 20 caracteres)
            </p>
          </div>

          {/* Welcome Message */}
          <div className="space-y-2">
            <Label htmlFor="welcomeMessage" className="text-white flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Mensagem de Boas-vindas *
            </Label>
            <Textarea
              id="welcomeMessage"
              placeholder="Ex: Olá! Bem-vindo(a) à nossa central de atendimento. Como posso ajudar você hoje?"
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              rows={3}
              className={`bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500 resize-none ${
                errors.welcomeMessage ? "border-red-500" : ""
              }`}
            />
            {errors.welcomeMessage && (
              <p className="text-red-400 text-sm">{errors.welcomeMessage}</p>
            )}
            <p className="text-gray-400 text-xs">
              Mensagem que será enviada automaticamente quando alguém iniciar uma conversa
            </p>
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 flex gap-3">
            <Info className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-yellow-200 text-sm font-semibold">Importante:</p>
              <ul className="text-yellow-200/80 text-xs space-y-1 list-disc list-inside">
                <li>Você precisará ter acesso ao telefone para escanear o QR Code</li>
                <li>O telefone deve estar com internet ativa durante a configuração</li>
                <li>Após conectar, mantenha o telefone ligado para receber mensagens</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleContinue}
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2"
        >
          Continuar para Conexão
        </Button>
      </div>
    </div>
  );
}
