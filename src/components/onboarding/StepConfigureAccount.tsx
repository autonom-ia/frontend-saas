"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, Info } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { apiService } from "@/lib/api";

type Parameter = {
  id: string;
  name: string;
  value: string;
  short_description?: string;
  help_text?: string;
  default_value?: string;
  visible_onboarding: boolean;
};

type JsonField = {
  key: string;
  label: string;
  value: string;
};

type StepConfigureAccountProps = {
  productId: string;
  onNext: (accountData: Record<string, string>) => void;
  onBack: () => void;
};

export default function StepConfigureAccount({ productId, onNext, onBack }: StepConfigureAccountProps) {
  const { theme } = useTheme();
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [jsonFields, setJsonFields] = useState<Record<string, JsonField[]>>({});
  
  // Campos fixos da conta
  const [accountName, setAccountName] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [accountPhone, setAccountPhone] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadParameters();
  }, [productId]);

  const loadParameters = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = await apiService.getProductParametersForOnboarding(productId);
      setParameters(params);
      
      // Inicializar formData com valores padrão ou existentes
      const initialData: Record<string, string> = {};
      const initialJsonFields: Record<string, JsonField[]> = {};
      
      params.forEach(param => {
        const value = param.value || param.default_value || '';
        
        // Tentar parsear como JSON
        if (isJsonString(value)) {
          try {
            const jsonObj = JSON.parse(value);
            // Para cada entry: key = identificador, val = descrição/label
            // O usuário vai preencher o valor, então inicializamos vazio
            const fields = Object.entries(jsonObj).map(([key, val]) => ({
              key,
              label: String(val || key), // val é o label/descrição
              value: '' // Input vazio para o usuário preencher
            }));
            initialJsonFields[param.name] = fields;
            // Inicializar JSON com valores vazios
            initialData[param.name] = JSON.stringify(
              Object.fromEntries(fields.map(f => [f.key, '']))
            );
          } catch {
            initialData[param.name] = '';
          }
        } else {
          initialData[param.name] = ''; // Sempre vazio inicialmente
        }
      });
      
      setFormData(initialData);
      setJsonFields(initialJsonFields);
    } catch (err) {
      console.error('Erro ao carregar parâmetros:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar parâmetros do produto');
    } finally {
      setLoading(false);
    }
  };

  const isJsonString = (str: string): boolean => {
    if (!str || typeof str !== 'string') return false;
    const trimmed = str.trim();
    return (trimmed.startsWith('{') && trimmed.endsWith('}')) || 
           (trimmed.startsWith('[') && trimmed.endsWith(']'));
  };

  const handleInputChange = (paramName: string, value: string) => {
    setFormData(prev => ({ ...prev, [paramName]: value }));
  };

  const handleJsonFieldChange = (paramName: string, fieldKey: string, value: string) => {
    setJsonFields(prev => {
      const fields = prev[paramName] || [];
      const updatedFields = fields.map(f => 
        f.key === fieldKey ? { ...f, value } : f
      );
      
      // Atualizar formData com JSON stringified
      const jsonObj: Record<string, string> = {};
      updatedFields.forEach(f => {
        jsonObj[f.key] = f.value;
      });
      setFormData(prevData => ({ ...prevData, [paramName]: JSON.stringify(jsonObj) }));
      
      return { ...prev, [paramName]: updatedFields };
    });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!accountName.trim()) {
      errors.accountName = "Nome da conta é obrigatório";
    }
    
    if (!accountEmail.trim()) {
      errors.accountEmail = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountEmail)) {
      errors.accountEmail = "Email inválido";
    }
    
    if (!accountPhone.trim()) {
      errors.accountPhone = "Telefone é obrigatório";
    } else if (!/^\d{10,15}$/.test(accountPhone.replace(/\D/g, ""))) {
      errors.accountPhone = "Telefone inválido (10-15 dígitos)";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinue = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Preparar dados para criação da conta
      const accountData = {
        accountName,
        accountEmail,
        accountPhone,
        productId,
        parameters: formData
      };
      
      // Criar conta via API
      const createdAccount = await apiService.createAccountOnboarding(accountData);
      
      console.log('[StepConfigureAccount] Conta criada:', createdAccount);
      
      // Passar dados completos para o próximo step
      onNext({
        accountId: createdAccount.id,
        accountName: createdAccount.name,
        accountEmail,
        accountPhone,
        ...formData
      });
    } catch (err) {
      console.error('[StepConfigureAccount] Erro ao criar conta:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar conta. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhoneChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    setAccountPhone(cleaned);
  };

  const renderField = (param: Parameter) => {
    const label = param.short_description || param.name;
    const placeholder = param.help_text || '';
    const value = formData[param.name] || '';
    
    // Se é JSON, renderizar múltiplos campos
    if (jsonFields[param.name]) {
      return (
        <div key={param.id} className="space-y-4">
          <div className="space-y-2">
            <Label className={`text-sm font-medium ${theme.colors.text.primary}`}>{label}</Label>
            {param.help_text && (
              <p className={`text-xs ${theme.colors.text.muted} flex items-start gap-2`}>
                <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>{param.help_text}</span>
              </p>
            )}
          </div>
          
          <Card className={`${theme.colors.background.card} ${theme.colors.border.primary}`}>
            <CardContent className="pt-6 space-y-4">
              {jsonFields[param.name].map((field, idx) => (
                <div key={idx} className="space-y-2">
                  <Label htmlFor={`${param.name}_${field.key}`} className={`text-sm ${theme.colors.text.secondary}`}>
                    {field.label}
                  </Label>
                  <Input
                    id={`${param.name}_${field.key}`}
                    value={field.value}
                    onChange={(e) => handleJsonFieldChange(param.name, field.key, e.target.value)}
                    className={`${theme.colors.background.secondary} ${theme.colors.border.secondary} ${theme.colors.text.primary}`}
                    autoComplete="off"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      );
    }
    
    // Campo de texto normal ou textarea
    const isLongText = param.name.includes('message') || param.name.includes('description');
    
    return (
      <div key={param.id} className="space-y-2">
        <Label htmlFor={param.name} className={`text-sm font-medium ${theme.colors.text.primary}`}>
          {label}
        </Label>
        {param.help_text && (
          <p className={`text-xs ${theme.colors.text.muted} flex items-start gap-2`}>
            <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <span>{param.help_text}</span>
          </p>
        )}
        {isLongText ? (
          <Textarea
            id={param.name}
            value={value}
            onChange={(e) => handleInputChange(param.name, e.target.value)}
            placeholder={placeholder}
            className={`${theme.colors.background.secondary} ${theme.colors.border.secondary} ${theme.colors.text.primary} min-h-[100px]`}
            rows={4}
            autoComplete="off"
          />
        ) : (
          <Input
            id={param.name}
            value={value}
            onChange={(e) => handleInputChange(param.name, e.target.value)}
            placeholder={placeholder}
            className={`${theme.colors.background.secondary} ${theme.colors.border.secondary} ${theme.colors.text.primary}`}
            autoComplete="off"
          />
        )}
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
        <p className={theme.colors.text.muted}>Carregando configurações...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className={`rounded-lg p-6 max-w-md border ${theme.colors.accent.error}`}>
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-semibold">Erro ao carregar parâmetros</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className={theme.colors.button.outline}>
            Voltar
          </Button>
          <Button onClick={loadParameters} className={theme.colors.button.primary}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (parameters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <p className={theme.colors.text.muted}>Nenhum parâmetro configurável encontrado</p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className={theme.colors.button.outline}>
            Voltar
          </Button>
          <Button onClick={handleContinue} className={theme.colors.button.primary}>
            Continuar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className={`text-2xl font-bold ${theme.colors.text.primary}`}>Configure sua Conta</h2>
        <p className={theme.colors.text.muted}>
          Preencha as informações para personalizar sua experiência
        </p>
      </div>

      {/* Campos Fixos da Conta */}
      <Card className={`${theme.colors.background.card} ${theme.colors.border.primary}`}>
        <CardHeader>
          <CardTitle className={theme.colors.text.primary}>Dados da Conta</CardTitle>
          <CardDescription className={theme.colors.text.muted}>
            Informações básicas obrigatórias
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Nome da Conta */}
          <div className="space-y-2">
            <Label htmlFor="accountName" className={`text-sm font-medium ${theme.colors.text.primary}`}>
              Nome da Conta *
            </Label>
            <Input
              id="accountName"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Ex: Nome da Empresa"
              className={`${theme.colors.background.secondary} ${theme.colors.border.secondary} ${theme.colors.text.primary} ${
                validationErrors.accountName ? "border-red-500" : ""
              }`}
              autoComplete="off"
            />
            {validationErrors.accountName && (
              <p className="text-red-400 text-xs">{validationErrors.accountName}</p>
            )}
            <p className={`text-xs ${theme.colors.text.muted} flex items-start gap-2`}>
              <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span>Escolha um nome descritivo para identificar esta conta</span>
            </p>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="accountEmail" className={`text-sm font-medium ${theme.colors.text.primary}`}>
              Email *
            </Label>
            <Input
              id="accountEmail"
              type="email"
              value={accountEmail}
              onChange={(e) => setAccountEmail(e.target.value)}
              placeholder="Ex: contato@empresa.com"
              className={`${theme.colors.background.secondary} ${theme.colors.border.secondary} ${theme.colors.text.primary} ${
                validationErrors.accountEmail ? "border-red-500" : ""
              }`}
              autoComplete="off"
            />
            {validationErrors.accountEmail && (
              <p className="text-red-400 text-xs">{validationErrors.accountEmail}</p>
            )}
            <p className={`text-xs ${theme.colors.text.muted} flex items-start gap-2`}>
              <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span>Email para notificações e recuperação de acesso</span>
            </p>
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <Label htmlFor="accountPhone" className={`text-sm font-medium ${theme.colors.text.primary}`}>
              Número de Telefone *
            </Label>
            <Input
              id="accountPhone"
              type="tel"
              value={accountPhone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="Ex: 5511999999999"
              className={`${theme.colors.background.secondary} ${theme.colors.border.secondary} ${theme.colors.text.primary} ${
                validationErrors.accountPhone ? "border-red-500" : ""
              }`}
              autoComplete="off"
            />
            {validationErrors.accountPhone && (
              <p className="text-red-400 text-xs">{validationErrors.accountPhone}</p>
            )}
            <p className={`text-xs ${theme.colors.text.muted} flex items-start gap-2`}>
              <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span>Formato: Código do país + DDD + Número (apenas números)</span>
            </p>
            
            {/* Warning */}
            <div className={`rounded-lg p-3 flex gap-3 border ${theme.colors.accent.warning}`}>
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">⚠️ Número Exclusivo</p>
                <p className="text-xs mt-1">
                  Use um número <strong>dedicado exclusivamente</strong> ao atendimento virtual.
                  <strong> NÃO use um número já vinculado a outro WhatsApp.</strong>
                  Recomendamos adquirir um chip novo.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parâmetros Dinâmicos */}
      {parameters.length > 0 && (
        <Card className={`${theme.colors.background.card} ${theme.colors.border.primary}`}>
          <CardHeader>
            <CardTitle className={theme.colors.text.primary}>Configurações Adicionais</CardTitle>
            <CardDescription className={theme.colors.text.muted}>
              Parâmetros específicos do produto selecionado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {parameters.map(param => renderField(param))}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-6">
        <Button 
          variant="outline" 
          onClick={onBack}
          className={theme.colors.button.outline}
        >
          Voltar
        </Button>
        <Button 
          onClick={handleContinue}
          disabled={submitting}
          className={theme.colors.button.primary}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Criando conta...
            </>
          ) : (
            'Continuar'
          )}
        </Button>
      </div>
    </div>
  );
}
