"use client";

import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, Clock, Phone, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { apiService, type MessageLog } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface MessageLogsProps {
  campaignId: string;
  refreshTrigger?: number;
}

export default function MessageLogs({ campaignId, refreshTrigger }: MessageLogsProps) {
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const { toast } = useToast();

  const itemsPerPage = 20;

  const loadLogs = async (page = 1) => {
    try {
      setLoading(true);
      const response = await apiService.getMessageLogs(campaignId, page, itemsPerPage);
      setLogs(response.logs);
      setTotalLogs(response.total);
      setCurrentPage(page);
    } catch (error) {
      toast({
        title: "Erro ao carregar logs",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [campaignId, refreshTrigger]);

  // Auto refresh every 30 seconds when enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadLogs(currentPage);
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, currentPage]);

  const formatPhone = (phone: string) => {
    if (phone.startsWith('+55')) {
      const cleaned = phone.replace('+55', '');
      if (cleaned.length === 11) {
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
      }
    }
    return phone;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (success: boolean) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        success 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {success ? 'Sucesso' : 'Falha'}
      </span>
    );
  };

  const totalPages = Math.ceil(totalLogs / itemsPerPage);
  const successCount = logs.filter(log => log.success).length;
  const failureCount = logs.filter(log => !log.success).length;

  if (loading && logs.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Carregando logs...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Stats and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Logs de Mensagens</h2>
          <p className="text-gray-600">{totalLogs} registros encontrados</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
          >
            <Clock className="h-4 w-4 mr-2" />
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadLogs(currentPage)}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {logs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-600">{successCount}</p>
                <p className="text-sm text-gray-500">Sucessos</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <XCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-600">{failureCount}</p>
                <p className="text-sm text-gray-500">Falhas</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <Phone className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{logs.length}</p>
                <p className="text-sm text-gray-500">Total (página)</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Logs Table */}
      <Card>
        {logs.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum log encontrado
            </h3>
            <p className="text-gray-500">
              Os logs de mensagens aparecerão aqui após o envio da campanha.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Erro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(log.success)}
                      {getStatusBadge(log.success)}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="font-mono text-sm">{formatPhone(log.phone_number)}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {formatDate(log.created_at)}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    {log.error ? (
                      <div className="max-w-xs">
                        <p className="text-sm text-red-600 truncate" title={log.error}>
                          {log.error}
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadLogs(currentPage - 1)}
              disabled={currentPage === 1 || loading}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadLogs(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
