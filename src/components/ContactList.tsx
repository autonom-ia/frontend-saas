"use client";

import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreHorizontal, Phone, User, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { apiService, type Contact } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ContactListProps {
  campaignId: string;
  refreshTrigger?: number;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  sent: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  read: 'bg-purple-100 text-purple-800',
};

const statusLabels = {
  pending: 'Pendente',
  sent: 'Enviado',
  delivered: 'Entregue',
  failed: 'Falhou',
  read: 'Lido',
};

export default function ContactList({ campaignId, refreshTrigger }: ContactListProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const { toast } = useToast();

  const itemsPerPage = 20;

  const loadContacts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await apiService.getContacts(campaignId, page, itemsPerPage);
      setContacts(response.contacts);
      setTotalContacts(response.total);
      setCurrentPage(page);
    } catch (error) {
      toast({
        title: "Erro ao carregar contatos",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, [campaignId, refreshTrigger]);

  const handleStatusUpdate = async (contactId: string, newStatus: string) => {
    try {
      await apiService.updateContactStatus(contactId, newStatus);
      
      // Update local state
      setContacts(prev => 
        prev.map(contact => 
          contact.id === contactId 
            ? { ...contact, external_status: newStatus }
            : contact
        )
      );

      toast({
        title: "Status atualizado",
        description: "Status do contato foi atualizado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar status",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm);
    
    const matchesStatus = selectedStatus === 'all' || contact.external_status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(totalContacts / itemsPerPage);

  const formatPhone = (phone: string) => {
    // Format phone number for display
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
    });
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Carregando contatos...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Contatos da Campanha</h2>
          <p className="text-gray-600">{totalContacts} contatos encontrados</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os status</option>
            <option value="pending">Pendente</option>
            <option value="sent">Enviado</option>
            <option value="delivered">Entregue</option>
            <option value="failed">Falhou</option>
            <option value="read">Lido</option>
          </select>
        </div>
      </div>

      {/* Contacts Table */}
      <Card>
        {filteredContacts.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum contato encontrado
            </h3>
            <p className="text-gray-500">
              {searchTerm || selectedStatus !== 'all' 
                ? 'Tente ajustar os filtros de busca.'
                : 'Importe contatos para começar a usar esta campanha.'
              }
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contato</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead>Dados Extras</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-500" />
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{contact.name}</div>
                        {contact.external_code && (
                          <div className="text-sm text-gray-500">ID: {contact.external_code}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="font-mono text-sm">{formatPhone(contact.phone)}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <select
                      value={contact.external_status || 'pending'}
                      onChange={(e) => handleStatusUpdate(contact.id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        statusColors[contact.external_status as keyof typeof statusColors] || statusColors.pending
                      }`}
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(contact.created_at)}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {contact.contact_data && Object.keys(contact.contact_data).length > 0 ? (
                      <div className="text-xs text-gray-500">
                        {Object.keys(contact.contact_data).length} campo(s) extra
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Nenhum</span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
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
              onClick={() => loadContacts(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadContacts(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
