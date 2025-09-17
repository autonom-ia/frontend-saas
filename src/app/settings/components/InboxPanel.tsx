"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export type InboxItem = { id?: string; name: string; status?: 'open'|'close'|'connecting'|'unknown'; notFound?: boolean };

export type InboxPanelProps = {
  open: boolean;
  inboxes: InboxItem[];
  loading?: boolean;
  syncingInstance?: string | null;
  connectionSuccess?: boolean;
  connectInfo?: { instance?: string; base64?: string; pairingCode?: string } | null;
  connectMethod?: 'qrcode' | 'pairing';
  onClose: () => void;
  onSyncInstance: (instanceName: string) => void;
};

export default function InboxPanel(props: InboxPanelProps) {
  const {
    open,
    inboxes,
    loading,
    syncingInstance,
    connectionSuccess,
    connectInfo,
    connectMethod,
    onClose,
    onSyncInstance,
  } = props;

  // Tabs state: default to prop, keep in sync if it changes
  const [method, setMethod] = useState<"qrcode" | "pairing">(connectMethod || "qrcode");
  useEffect(() => {
    if (connectMethod && connectMethod !== method) setMethod(connectMethod);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectMethod]);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!open}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold dark:text-white">Inboxes e WhatsApp</h2>
          <button
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
            onClick={onClose}
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
        <div className="p-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm max-h-[75vh] overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                <tr>
                  <th className="text-left px-4 py-2 dark:text-gray-100">Instância</th>
                  <th className="text-left px-4 py-2 dark:text-gray-100">Status</th>
                  <th className="text-right px-4 py-2 dark:text-gray-100">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td className="px-4 py-3 dark:text-gray-200" colSpan={3}>Carregando...</td></tr>
                ) : inboxes.length === 0 ? (
                  <tr><td className="px-4 py-3 dark:text-gray-200" colSpan={3}>Nenhum inbox encontrado.</td></tr>
                ) : (
                  inboxes.map(it => (
                    <tr key={it.name}>
                      <td className="px-4 py-2 dark:text-gray-100">{it.name}</td>
                      <td className="px-4 py-2 dark:text-gray-100">
                        {it.status === 'open' && <span className="text-green-600">Conectado</span>}
                        {it.status === 'close' && <span className="text-red-500">Desconectado</span>}
                        {it.status === 'connecting' && <span className="text-yellow-600">Conectando</span>}
                        {(it.status === 'unknown' || !it.status) && <span className="text-gray-400">Não Encontrada</span>}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {it.status !== 'open' ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="bg-gray-700 hover:bg-gray-600 text-white"
                            onClick={() => onSyncInstance(it.name)}
                            disabled={syncingInstance === it.name}
                          >
                            <RefreshCw className={syncingInstance === it.name ? 'animate-spin' : ''} />
                          </Button>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Instruções de conexão / Sucesso */}
          {connectionSuccess ? (
            <div className="mt-4">
              <div className="rounded-lg p-6 max-w-xl mx-auto border border-sky-600 bg-black text-white text-center">
                <div className="text-sky-500 text-5xl mb-4">✓</div>
                <h3 className="text-2xl font-semibold mb-2">Conexão Realizada com Sucesso!</h3>
                <p className="text-sm text-gray-200 mb-6">Parabéns! Seu WhatsApp foi conectado com sucesso ao serviço.</p>
              </div>
            </div>
          ) : (!loading && inboxes.some(it => it.status !== 'open')) && (
            <div className="mt-4">
              <div className="rounded-lg p-6 max-w-xl mx-auto border border-gray-200 dark:border-gray-700 bg-black text-white">
                {/* Tabs-style header */}
                <div className="flex items-center gap-6 mb-4 border-b border-gray-700">
                  <button
                    type="button"
                    onClick={() => setMethod('qrcode')}
                    className={`-mb-px px-2 py-2 border-b-2 ${method === 'qrcode' ? 'border-sky-500 text-sky-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                  >
                    QR Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod('pairing')}
                    className={`-mb-px px-2 py-2 border-b-2 ${method === 'pairing' ? 'border-sky-500 text-sky-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                  >
                    Código
                  </button>
                </div>

                {method === 'qrcode' ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sky-400 font-semibold mb-3">Como conectar usando QR Code</h3>
                      <ul className="text-sm space-y-3">
                        <li className="flex"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-black font-bold mr-3">1</span><span>Abra o WhatsApp no seu celular</span></li>
                        <li className="flex"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-black font-bold mr-3">2</span><span>Toque em Mais opções ⋮ ou Configurações ⚙️</span></li>
                        <li className="flex"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-black font-bold mr-3">3</span><span>Selecione &quot;Aparelhos conectados&quot;</span></li>
                        <li className="flex"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-black font-bold mr-3">4</span><span>Toque em &quot;Conectar um aparelho&quot;</span></li>
                        <li className="flex"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-black font-bold mr-3">5</span><span>Aponte a câmera para o QR Code abaixo</span></li>
                      </ul>
                    </div>
                    <div className="flex items-center justify-center">
                      {connectInfo?.base64 ? (
                        <img src={`data:image/png;base64,${connectInfo.base64}`} alt="QR Code" className="rounded border border-gray-600" />
                      ) : (
                        <div className="text-gray-400 text-sm text-center">QR Code não disponível. Sincronize a instância.</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sky-400 font-semibold mb-3">Como conectar usando Código de Pareamento</h3>
                      <ul className="text-sm space-y-3">
                        <li className="flex"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-black font-bold mr-3">1</span><span>Abra o WhatsApp no seu celular</span></li>
                        <li className="flex"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-black font-bold mr-3">2</span><span>Toque em Mais opções ⋮ ou Configurações ⚙️</span></li>
                        <li className="flex"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-black font-bold mr-3">3</span><span>Selecione &quot;Aparelhos conectados&quot;</span></li>
                        <li className="flex"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-black font-bold mr-3">4</span><span>Toque em &quot;Conectar um aparelho&quot;</span></li>
                        <li className="flex"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-black font-bold mr-3">5</span><span>Toque em &quot;Conectar com código&quot;</span></li>
                        <li className="flex"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-black font-bold mr-3">6</span><span>Digite o código de 8 dígitos que será exibido na próxima tela</span></li>
                      </ul>
                    </div>
                    <div className="flex items-center justify-center">
                      {connectInfo?.pairingCode ? (
                        <div className="text-4xl tracking-widest font-mono">{connectInfo.pairingCode}</div>
                      ) : (
                        <div className="text-gray-400 text-sm text-center">Código não disponível. Sincronize a instância.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
