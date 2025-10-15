"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Users, Send, BarChart3, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import ContactUpload from '@/components/ContactUpload';
import ContactList from '@/components/ContactList';
import CampaignSender from '@/components/CampaignSender';
import MessageLogs from '@/components/MessageLogs';
import CampaignStats from '@/components/CampaignStats';
import { apiService, type Campaign } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/Sidebar';

type TabType = 'contacts' | 'logs' | 'settings';

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('contacts');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [totalContacts, setTotalContacts] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadCampaign();
  }, [campaignId]);

  const loadCampaign = async () => {
    try {
      setLoading(true);
      const campaigns = await apiService.getCampaigns();
      const foundCampaign = campaigns.find(c => c.id === campaignId);
      
      if (!foundCampaign) {
        toast({
          title: "Campanha não encontrada",
          description: "A campanha solicitada não foi encontrada.",
          variant: "destructive",
        });
        router.push('/campaigns');
        return;
      }
      
      setCampaign(foundCampaign);
      
      // Load contact count
      const contactsResponse = await apiService.getContacts(campaignId, 1, 1);
      setTotalContacts(contactsResponse.total);
    } catch (error) {
      toast({
        title: "Erro ao carregar campanha",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = () => {
    setShowUploadDialog(false);
    setRefreshTrigger(prev => prev + 1);
    loadCampaign(); // Refresh contact count
  };

  const handleSendComplete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const tabs = [
    { id: 'contacts' as TabType, label: 'Contatos', icon: Users },
    { id: 'logs' as TabType, label: 'Logs', icon: BarChart3 },
    { id: 'settings' as TabType, label: 'Configurações', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Carregando campanha...</span>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Campanha não encontrada
            </h2>
            <Button onClick={() => router.push('/campaigns')}>
              Voltar para Campanhas
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/campaigns')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
                <p className="text-gray-600">
                  {campaign.description || 'Sem descrição'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Importar Contatos
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Importar Contatos</DialogTitle>
                  </DialogHeader>
                  <ContactUpload
                    campaignId={campaignId}
                    onUploadComplete={handleUploadComplete}
                    onClose={() => setShowUploadDialog(false)}
                  />
                </DialogContent>
              </Dialog>
              
              {totalContacts > 0 && (
                <CampaignSender
                  campaignId={campaignId}
                  campaignName={campaign.name}
                  totalContacts={totalContacts}
                  onSendComplete={handleSendComplete}
                />
              )}
            </div>
          </div>
          
          {/* Campaign Stats */}
          <div className="mt-4">
            <CampaignStats
              campaignId={campaignId}
              refreshTrigger={refreshTrigger}
            />
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white border-b border-gray-200 px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'contacts' && (
            <ContactList
              campaignId={campaignId}
              refreshTrigger={refreshTrigger}
            />
          )}
          
          {activeTab === 'logs' && (
            <MessageLogs
              campaignId={campaignId}
              refreshTrigger={refreshTrigger}
            />
          )}
          
          {activeTab === 'settings' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Configurações da Campanha</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Campanha
                  </label>
                  <p className="text-gray-900">{campaign.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <p className="text-gray-900">{campaign.description || 'Sem descrição'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template de Mensagem
                  </label>
                  <p className="text-gray-900">{campaign.template_name || 'Não definido'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Criação
                  </label>
                  <p className="text-gray-900">
                    {campaign.created_at 
                      ? new Date(campaign.created_at).toLocaleDateString('pt-BR')
                      : 'Não disponível'
                    }
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
