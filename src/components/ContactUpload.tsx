"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { apiService, type UploadResponse } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ContactUploadProps {
  campaignId: string;
  onUploadComplete?: (result: UploadResponse) => void;
  onClose?: () => void;
}

export default function ContactUpload({ campaignId, onUploadComplete, onClose }: ContactUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      setUploadResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const result = await apiService.uploadContacts(campaignId, selectedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadResult(result);
      
      toast({
        title: "Upload concluído!",
        description: `${result.data.processed} contatos processados com sucesso.`,
      });

      if (onUploadComplete) {
        onUploadComplete(result);
      }
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setUploadProgress(0);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Importar Contatos</h2>
          <p className="text-gray-600">Faça upload de um arquivo CSV ou XLSX com os contatos da campanha</p>
        </div>
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* File Upload Area */}
      {!uploadResult && (
        <Card className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-blue-600">Solte o arquivo aqui...</p>
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Arraste e solte seu arquivo aqui
                </p>
                <p className="text-gray-500 mb-4">ou clique para selecionar</p>
                <p className="text-sm text-gray-400">
                  Formatos aceitos: CSV, XLSX (máx. 10MB)
                </p>
              </div>
            )}
          </div>

          {/* Selected File Info */}
          {selectedFile && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetUpload}
                    disabled={uploading}
                  >
                    Remover
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    size="sm"
                  >
                    {uploading ? 'Enviando...' : 'Fazer Upload'}
                  </Button>
                </div>
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Processando arquivo...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Upload Result */}
      {uploadResult && (
        <Card className="p-6">
          <div className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upload Concluído!
            </h3>
            <p className="text-gray-600 mb-6">
              Seu arquivo foi processado com sucesso.
            </p>

            {/* Results Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {uploadResult.data.processed}
                </div>
                <div className="text-sm text-gray-500">Processados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {uploadResult.data.duplicates}
                </div>
                <div className="text-sm text-gray-500">Duplicados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {uploadResult.data.errors}
                </div>
                <div className="text-sm text-gray-500">Erros</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-3">
              <Button variant="outline" onClick={resetUpload}>
                Importar Mais
              </Button>
              {onClose && (
                <Button onClick={onClose}>
                  Continuar
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Instructions */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 mb-1">Formato do arquivo:</p>
            <ul className="text-blue-800 space-y-1">
              <li>• <strong>name:</strong> Nome do contato (obrigatório)</li>
              <li>• <strong>phone:</strong> Telefone (obrigatório, formato: +5511999999999)</li>
              <li>• Colunas adicionais serão salvas como dados extras</li>
              <li>• Contatos duplicados (mesmo telefone) serão ignorados</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
