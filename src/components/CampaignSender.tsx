"use client";

import React, { useState } from 'react';
import { Send, AlertTriangle, CheckCircle, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { apiService } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface CampaignSenderProps {
  campaignId: string;
  campaignName: string;
  totalContacts: number;
  onSendComplete?: () => void;
}

interface SendResult {
  sent: number;
  failed: number;
  total: number;
}

export default function CampaignSender({ 
  campaignId, 
  campaignName, 
  totalContacts,
  onSendComplete 
}: CampaignSenderProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<SendResult | null>(null);
  const [sendProgress, setSendProgress] = useState(0);
  const { toast } = useToast();

  const handleSendCampaign = async () => {
    setSending(true);
    setSendProgress(0);
    setSendResult(null);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setSendProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 500);

      const result = await apiService.sendCampaignMessages(campaignId);
      
      clearInterval(progressInterval);
      setSendProgress(100);
      setSendResult(result.data);
      
      toast({
        title: "Campanha enviada!",
        description: `${result.data.sent} mensagens enviadas com sucesso.`,
      });

      if (onSendComplete) {
        onSendComplete();
      }
    } catch (error) {
      toast({
        title: "Erro ao enviar campanha",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const resetSend = () => {
    setSendResult(null);
    setSendProgress(0);
    setIsDialogOpen(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <Send className="h-4 w-4 mr-2" />
          Enviar Campanha
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar Campanha</DialogTitle>
          <DialogDescription>
            Confirme o envio da campanha &ldquo;{campaignName}&rdquo; para todos os contatos.
          </DialogDescription>
        </DialogHeader>

        {!sendResult && !sending && (
          <div className="space-y-4">
            {/* Campaign Info */}
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium text-blue-900">
                    {totalContacts} contatos serão processados
                  </p>
                  <p className="text-sm text-blue-700">
                    As mensagens serão enviadas via n8n.io
                  </p>
                </div>
              </div>
            </Card>

            {/* Warning */}
            <Card className="p-4 bg-yellow-50 border-yellow-200">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-900 mb-1">
                    Atenção:
                  </p>
                  <ul className="text-yellow-800 space-y-1">
                    <li>• Esta ação não pode ser desfeita</li>
                    <li>• Contatos duplicados serão ignorados</li>
                    <li>• O status de cada contato será atualizado automaticamente</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Sending Progress */}
        {sending && (
          <div className="space-y-4">
            <div className="text-center">
              <Clock className="mx-auto h-8 w-8 text-blue-500 mb-2" />
              <p className="font-medium">Enviando mensagens...</p>
              <p className="text-sm text-gray-500">
                Processando {totalContacts} contatos
              </p>
            </div>
            
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progresso</span>
                <span>{sendProgress}%</span>
              </div>
              <Progress value={sendProgress} className="h-2" />
            </div>
          </div>
        )}

        {/* Send Result */}
        {sendResult && (
          <div className="space-y-4">
            <div className="text-center">
              <CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
              <p className="font-medium text-green-900">
                Campanha enviada com sucesso!
              </p>
            </div>

            {/* Results Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-600">
                  {sendResult.sent}
                </div>
                <div className="text-xs text-green-700">Enviadas</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-xl font-bold text-red-600">
                  {sendResult.failed}
                </div>
                <div className="text-xs text-red-700">Falharam</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-600">
                  {sendResult.total}
                </div>
                <div className="text-xs text-blue-700">Total</div>
              </div>
            </div>

            {sendResult.failed > 0 && (
              <Card className="p-3 bg-yellow-50 border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  {sendResult.failed} mensagens falharam. Verifique os logs para mais detalhes.
                </p>
              </Card>
            )}
          </div>
        )}

        <DialogFooter>
          {!sendResult && !sending && (
            <>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSendCampaign}
                className="bg-green-600 hover:bg-green-700"
              >
                Confirmar Envio
              </Button>
            </>
          )}
          
          {sending && (
            <Button variant="outline" disabled>
              Enviando...
            </Button>
          )}
          
          {sendResult && (
            <Button onClick={resetSend}>
              Fechar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
