"use client";

import React, { useState, useEffect } from 'react';
import { Users, Send, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { apiService } from '@/lib/api';

interface CampaignStatsProps {
  campaignId: string;
  refreshTrigger?: number;
}

interface Stats {
  totalContacts: number;
  sentMessages: number;
  deliveredMessages: number;
  failedMessages: number;
  pendingMessages: number;
  deliveryRate: number;
}

export default function CampaignStats({ campaignId, refreshTrigger }: CampaignStatsProps) {
  const [stats, setStats] = useState<Stats>({
    totalContacts: 0,
    sentMessages: 0,
    deliveredMessages: 0,
    failedMessages: 0,
    pendingMessages: 0,
    deliveryRate: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Load contacts count
      const contactsResponse = await apiService.getContacts(campaignId, 1, 1);
      const totalContacts = contactsResponse.total;
      
      // Load message logs to calculate stats
      const logsResponse = await apiService.getMessageLogs(campaignId, 1, 1000);
      const logs = logsResponse.logs;
      
      const sentMessages = logs.length;
      const deliveredMessages = logs.filter(log => log.success).length;
      const failedMessages = logs.filter(log => !log.success).length;
      const pendingMessages = Math.max(0, totalContacts - sentMessages);
      const deliveryRate = sentMessages > 0 ? (deliveredMessages / sentMessages) * 100 : 0;
      
      setStats({
        totalContacts,
        sentMessages,
        deliveredMessages,
        failedMessages,
        pendingMessages,
        deliveryRate,
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [campaignId, refreshTrigger]);

  const statCards = [
    {
      title: 'Total de Contatos',
      value: stats.totalContacts,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
    {
      title: 'Mensagens Enviadas',
      value: stats.sentMessages,
      icon: Send,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-500',
    },
    {
      title: 'Entregues',
      value: stats.deliveredMessages,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-500',
    },
    {
      title: 'Falharam',
      value: stats.failedMessages,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-500',
    },
    {
      title: 'Pendentes',
      value: stats.pendingMessages,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-500',
    },
    {
      title: 'Taxa de Entrega',
      value: `${stats.deliveryRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-500',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="p-4">
            <div className="animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className={`p-4 ${stat.bgColor} border-0`}>
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 truncate">
                  {stat.title}
                </p>
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
