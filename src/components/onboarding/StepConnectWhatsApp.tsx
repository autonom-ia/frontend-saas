"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Smartphone, CheckCircle2, Loader2, RefreshCw, ClipboardCheck } from "lucide-react";

type StepConnectWhatsAppProps = {
  accountId: string;
  accountPhone: string;
  onNext: () => void;
};

export default function StepConnectWhatsApp({ accountId, accountPhone, onNext }: StepConnectWhatsAppProps) {
  const [subStep, setSubStep] = useState<"preparation" | "connection">("preparation");
  const [connectMethod, setConnectMethod] = useState<'qrcode' | 'pairing'>('qrcode');
  const [qrCodeBase64, setQrCodeBase64] = useState<string>("");
  const [pairingCode, setPairingCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>("Aguardando preparação...");
  const [error, setError] = useState<string | null>(null);

  // Buscar token de autenticação
  const getAuthToken = () => {
    try {
      const stored = localStorage.getItem('userData');
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      return parsed.IdToken || parsed.token || parsed.AccessToken;
    } catch {
      return null;
    }
  };

  // Verificar status da conexão
  const checkConnectionStatus = async (): Promise<'open' | 'close' | 'connecting' | 'unknown'> => {
    try {
      const token = getAuthToken();
      const apiUrl = process.env.NEXT_PUBLIC_EVOLUTION_API_URL || process.env.NEXT_PUBLIC_API_URL;
      const url = `${apiUrl}/Autonomia/Evolution/ConnectionState?account_id=${accountId}&instance=${accountPhone}`;
      
      const resp = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
        mode: 'cors'
      });
      
      if (!resp.ok) {
        console.error('Erro ao verificar status:', resp.status, await resp.text());
        return 'unknown';
      }
      
      const data = await resp.json();
      return data?.instance?.state || 'unknown';
    } catch (err) {
      console.error('Erro ao verificar status:', err);
      return 'unknown';
    }
  };

  // Configurar Chatwoot após conexão bem-sucedida
  const configureChatwoot = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.warn('Token não disponível para configurar Chatwoot');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_EVOLUTION_API_URL || process.env.NEXT_PUBLIC_API_URL;
      const url = `${apiUrl}/Autonomia/Evolution/SetChatwoot/${accountPhone}?account_id=${accountId}`;
      
      console.log('Configurando Chatwoot...', { accountId, instance: accountPhone });
      
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        mode: 'cors',
        body: JSON.stringify({ enabled: true })
      });
      
      if (!resp.ok) {
        const errorText = await resp.text();
        console.error('Erro ao configurar Chatwoot:', resp.status, errorText);
        // Não bloqueia o fluxo, apenas loga o erro
        return;
      }
      
      const data = await resp.json();
      console.log('Chatwoot configurado com sucesso:', data);
    } catch (err) {
      console.error('Erro ao configurar Chatwoot:', err);
      // Não bloqueia o fluxo
    }
  };

  // Criar instância e obter QR Code
  const handleReady = async () => {
    setSubStep("connection");
    setIsLoading(true);
    setError(null);
    setConnectionStatus("Criando instância WhatsApp...");
    
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }
      
      const apiUrl = process.env.NEXT_PUBLIC_EVOLUTION_API_URL || process.env.NEXT_PUBLIC_API_URL;
      const url = `${apiUrl}/Autonomia/Evolution/CreateInstance`;
      
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        mode: 'cors',
        body: JSON.stringify({
          account_id: accountId,
          instanceName: accountPhone,
          qrcode: true
        })
      });
      
      if (!resp.ok) {
        const errorText = await resp.text();
        console.error('Erro ao criar instância:', resp.status, errorText);
        throw new Error('Falha ao criar instância WhatsApp');
      }
      
      const data = await resp.json();
      const base64 = data?.base64 || data?.data?.base64 || '';
      const pairing = data?.pairingCode || data?.data?.pairingCode || '';
      
      if (base64) {
        setQrCodeBase64(base64);
        setConnectMethod('qrcode');
        setConnectionStatus("Escaneie o QR Code com seu WhatsApp");
      } else if (pairing) {
        setPairingCode(pairing);
        setConnectMethod('pairing');
        setConnectionStatus("Digite o código no seu WhatsApp");
      } else {
        throw new Error('Nenhum método de conexão disponível');
      }
      
      setIsLoading(false);
      startPolling();
    } catch (err: any) {
      console.error('Erro ao criar instância:', err);
      setError(err.message || 'Erro ao criar instância');
      setConnectionStatus('Erro na criação da instância');
      setIsLoading(false);
    }
  };

  // Polling para verificar se conectou
  const startPolling = () => {
    let attempts = 0;
    const maxAttempts = 60; // 2 minutos (60 * 2s)
    
    const interval = setInterval(async () => {
      attempts++;
      
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        setConnectionStatus('Tempo esgotado. Tente novamente.');
        return;
      }
      
      const status = await checkConnectionStatus();
      
      if (status === 'open') {
        clearInterval(interval);
        setIsConnected(true);
        setConnectionStatus('Conectado com sucesso! Configurando Chatwoot...');
        
        // Configurar Chatwoot automaticamente
        await configureChatwoot();
        
        setConnectionStatus('Tudo pronto!');
        setTimeout(() => {
          onNext();
        }, 1500);
      }
    }, 2000);
  };

  // Atualizar QR Code
  const handleRefreshQrCode = () => {
    handleReady();
  };

  // Preparation Step (Sub-step 1)
  if (subStep === "preparation") {
    return (
      <div className="space-y-6">
        {/* Instructions */}
        <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
          <h2 className="text-white text-lg font-semibold mb-2 flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Preparação para Conexão WhatsApp
          </h2>
          <p className="text-gray-300 text-sm">
            Antes de conectar, certifique-se de ter tudo pronto. Siga as instruções abaixo para garantir uma conexão bem-sucedida.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Requirements Card */}
          <Card className="bg-gray-800/60 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Requisitos</CardTitle>
              <CardDescription className="text-gray-400">
                Verifique se você tem o seguinte:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {[
                  {
                    title: "Número de telefone válido",
                    description: "O número configurado não pode estar em uso em outro WhatsApp"
                  },
                  {
                    title: "WhatsApp instalado",
                    description: "Tenha o WhatsApp instalado e ativo no seu telefone"
                  },
                  {
                    title: "Acesso ao telefone",
                    description: "Você precisará do telefone em mãos para escanear o QR Code"
                  },
                  {
                    title: "Conexão com internet",
                    description: "Certifique-se de que seu telefone está conectado à internet"
                  }
                ].map((item, index) => (
                  <li key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-600 flex items-center justify-center mt-0.5">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{item.title}</p>
                      <p className="text-gray-400 text-xs mt-1">{item.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Instructions Card */}
          <Card className="bg-gray-800/60 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Passo a Passo</CardTitle>
              <CardDescription className="text-gray-400">
                Como você irá conectar sua conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {[
                  {
                    number: 1,
                    title: "Clique em 'Tudo Pronto'",
                    description: "Quando estiver preparado, clique no botão abaixo"
                  },
                  {
                    number: 2,
                    title: "Aguarde o QR Code",
                    description: "Será gerado um QR Code exclusivo para você"
                  },
                  {
                    number: 3,
                    title: "Abra o WhatsApp",
                    description: "No seu telefone, vá em Menu > Dispositivos Conectados"
                  },
                  {
                    number: 4,
                    title: "Escaneie o código",
                    description: "Use a câmera do WhatsApp para escanear o QR Code"
                  }
                ].map((step) => (
                  <li key={step.number} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                      {step.number}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{step.title}</p>
                      <p className="text-gray-400 text-xs mt-1">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* Ready Button */}
        <div className="flex justify-center pt-6">
          <Button
            onClick={handleReady}
            className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-3 text-lg"
          >
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Tudo Pronto - Gerar QR Code
          </Button>
        </div>
      </div>
    );
  }

  // Connection Step (Sub-step 2)
  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
        <h2 className="text-white text-lg font-semibold mb-2 flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Conectar ao WhatsApp
        </h2>
        <p className="text-gray-300 text-sm">
          {connectMethod === 'qrcode' 
            ? 'Escaneie o QR Code com o WhatsApp do seu telefone para vincular a conta.'
            : 'Digite o código de pareamento no seu WhatsApp para vincular a conta.'}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4">
          <p className="text-red-300 text-sm">{error}</p>
          <Button
            onClick={handleReady}
            className="mt-3 bg-red-600 hover:bg-red-500 text-white"
          >
            Tentar Novamente
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connection Display Card */}
        <Card className="bg-gray-800/60 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {connectMethod === 'qrcode' ? (
                <><QrCode className="h-5 w-5" /> QR Code</>
              ) : (
                <><Smartphone className="h-5 w-5" /> Código de Pareamento</>
              )}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {connectionStatus}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-[300px] w-[300px] bg-gray-900/50 rounded-lg">
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-400 text-sm">Aguarde...</p>
              </div>
            ) : isConnected ? (
              <div className="flex flex-col items-center justify-center h-[300px] w-[300px] bg-green-900/30 rounded-lg border-2 border-green-500">
                <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                <p className="text-green-400 font-semibold">Conectado!</p>
                <p className="text-gray-400 text-xs mt-2">Redirecionando...</p>
              </div>
            ) : connectMethod === 'qrcode' && qrCodeBase64 ? (
              <>
                <div className="relative h-[300px] w-[300px] bg-white p-4 rounded-lg">
                  <img
                    src={qrCodeBase64.startsWith('data:image') ? qrCodeBase64 : `data:image/png;base64,${qrCodeBase64}`}
                    alt="QR Code para conectar WhatsApp"
                    className="w-full h-full"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={handleRefreshQrCode}
                  className="text-gray-300 border-gray-600 hover:bg-gray-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Gerar Novo QR Code
                </Button>
              </>
            ) : connectMethod === 'pairing' && pairingCode ? (
              <div className="flex flex-col items-center justify-center h-[300px] w-[300px] bg-gray-900/50 rounded-lg">
                <p className="text-gray-400 text-sm mb-4">Digite este código no WhatsApp:</p>
                <div className="text-6xl tracking-widest font-mono text-white font-bold">
                  {pairingCode}
                </div>
                <Button
                  variant="outline"
                  onClick={handleRefreshQrCode}
                  className="mt-6 text-gray-300 border-gray-600 hover:bg-gray-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Gerar Novo Código
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] w-[300px] bg-gray-900/50 rounded-lg">
                <p className="text-gray-400 text-sm">Aguardando conexão...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions Card */}
        <Card className="bg-gray-800/60 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Como Conectar</CardTitle>
            <CardDescription className="text-gray-400">
              Siga os passos abaixo para conectar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {(connectMethod === 'qrcode' ? [
                {
                  number: 1,
                  title: "Abra o WhatsApp no seu telefone",
                  description: "Toque em Menu (⋮) ou Configurações"
                },
                {
                  number: 2,
                  title: "Dispositivos Conectados",
                  description: "Selecione 'Dispositivos conectados'"
                },
                {
                  number: 3,
                  title: "Conectar Dispositivo",
                  description: "Toque em 'Conectar um aparelho'"
                },
                {
                  number: 4,
                  title: "Escaneie o QR Code",
                  description: "Aponte a câmera do telefone para o QR Code ao lado"
                }
              ] : [
                {
                  number: 1,
                  title: "Abra o WhatsApp no seu telefone",
                  description: "Toque em Menu (⋮) ou Configurações"
                },
                {
                  number: 2,
                  title: "Dispositivos Conectados",
                  description: "Selecione 'Dispositivos conectados'"
                },
                {
                  number: 3,
                  title: "Conectar com Código",
                  description: "Toque em 'Conectar um aparelho' e depois 'Conectar com código'"
                },
                {
                  number: 4,
                  title: "Digite o Código",
                  description: "Digite o código de 8 dígitos exibido ao lado"
                }
              ]).map((step) => (
                <li key={step.number} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                    {step.number}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{step.title}</p>
                    <p className="text-gray-400 text-xs mt-1">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>

            {/* Método de conexão alternativo */}
            {!isConnected && !isLoading && (qrCodeBase64 || pairingCode) && (
              <div className="mt-6 pt-6 border-t border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => setConnectMethod(connectMethod === 'qrcode' ? 'pairing' : 'qrcode')}
                  className="w-full text-gray-300 border-gray-600 hover:bg-gray-700"
                  disabled={!(qrCodeBase64 && pairingCode)}
                >
                  {connectMethod === 'qrcode' ? 'Usar Código de Pareamento' : 'Usar QR Code'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
