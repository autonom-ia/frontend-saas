"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, Upload, RefreshCw } from "lucide-react";

export type KnowledgeDocument = {
  id: string;
  filename: string;
  category?: string | null;
  category_id?: string | null;
  document_types?: unknown | null;
  file_extension?: string | null;
  document_url?: string | null;
  account_id: string;
  created_at?: string;
  updated_at?: string;
  account_name?: string | null;
};

type Props = {
  accountId: string;
  authToken?: string;
  isAdmin: boolean;
  refreshKey?: number;
};

export default function KnowledgeBaseGrid({ accountId, authToken, isAdmin, refreshKey = 0 }: Props) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<KnowledgeDocument[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // Drawer state
  const [openView, setOpenView] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [selected, setSelected] = useState<KnowledgeDocument | null>(null);

  // Create form
  const [file, setFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState<string>("");
  const [fileExt, setFileExt] = useState<string>(""); // with dot, e.g. .pdf
  const [saving, setSaving] = useState(false);

  const saasApiUrl = useMemo(() => process.env.NEXT_PUBLIC_SAAS_API_URL || "https://api-saas.autonomia.site", []);
  const tokenToUse = authToken;

  const headers = useMemo(() => ({
    Authorization: tokenToUse ? `Bearer ${tokenToUse}` : "",
  }), [tokenToUse]);

  const fetchDocuments = async () => {
    // Debug: track fetch
    console.log('[KB] fetchDocuments accountId=', accountId);
    setLoading(true);
    setError(null);
    try {
      const url = `${saasApiUrl}/Autonomia/Saas/KnowledgeDocuments?accountId=${encodeURIComponent(accountId)}`;
      const resp = await fetch(url, { headers: headers.Authorization ? headers : undefined, mode: "cors" });
      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(`Falha ao listar documentos: ${resp.status} ${resp.statusText} ${t}`);
      }
      const j = await resp.json();
      const list = Array.isArray(j?.data) ? j.data as KnowledgeDocument[] : [];
      setItems(list);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Erro ao listar documentos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('[KB] mount/useEffect -> accountId:', accountId, 'refreshKey:', refreshKey);
    if (!accountId) return;
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, refreshKey]);

  const resetCreateForm = () => {
    setFile(null);
    setDocumentName("");
    setFileExt("");
  };

  const fileToBase64 = (f: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      const base64 = res.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(f);
  });

  const handleCreate = async () => {
    if (!file) {
      alert("Selecione um arquivo .pdf ou .docx");
      return;
    }
    const ext = (fileExt || `.${(file.name.split('.').pop() || '').toLowerCase()}`).toLowerCase();
    const extNoDot = ext.replace(/^\./, '');
    if (!['pdf', 'docx'].includes(extNoDot)) {
      alert("Apenas arquivos PDF ou DOCX são permitidos.");
      return;
    }

    const effectiveName = documentName || file.name;

    setSaving(true);
    try {
      const base64 = await fileToBase64(file);
      const payload = {
        filename: effectiveName,
        file_extension: ext,
        file_base64: base64,
        file_mime: file.type || (extNoDot === 'pdf' ? 'application/pdf' : extNoDot === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/octet-stream'),
        account_id: accountId,
      };

      const resp = await fetch(`${saasApiUrl}/Autonomia/Saas/KnowledgeDocuments`, {
        method: "POST",
        headers: {
          Authorization: headers.Authorization,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        mode: "cors",
      });
      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(`Falha ao criar documento: ${resp.status} ${resp.statusText} ${t}`);
      }
      await fetchDocuments();
      setOpenCreate(false);
      resetCreateForm();
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Erro ao criar documento");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Confirmar exclusão do documento?")) return;
    try {
      const resp = await fetch(`${saasApiUrl}/Autonomia/Saas/KnowledgeDocuments/${id}`, {
        method: "DELETE",
        headers: {
          ...(headers.Authorization ? { Authorization: headers.Authorization } : {}),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ account_id: accountId, IdToken: tokenToUse }),
        mode: "cors",
      });
      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(`Falha ao excluir: ${resp.status} ${resp.statusText} ${t}`);
      }
      await fetchDocuments();
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Erro ao excluir");
    }
  };

  const handleSync = async (id: string) => {
    try {
      setSyncingId(id);
      console.log('[KB] sync start', { documentId: id, accountId });
      const url = `${saasApiUrl}/Autonomia/Saas/KnowledgeDocuments/${encodeURIComponent(id)}/sync`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          ...(headers.Authorization ? { Authorization: headers.Authorization } : {}),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ account_id: accountId, IdToken: tokenToUse }),
        mode: 'cors',
      });
      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(`Falha ao sincronizar: ${resp.status} ${resp.statusText} ${t}`);
      }
      alert('Sincronização disparada com sucesso. Aguarde o processamento.');
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : 'Erro ao sincronizar documento');
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <section className="mt-6 transition-all duration-400 ease-out">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {!loading && error && (
            <span className="text-sm text-red-400">{error}</span>
          )}
        </div>
        {isAdmin && (
          <Button
            className="bg-blue-600 hover:bg-blue-500 text-white"
            size="sm"
            onClick={() => setOpenCreate(true)}
            title="Incluir documento"
          >
            + Incluir
          </Button>
        )}
      </div>

      <div className="h-3" />
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm max-h-[50vh] overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
            <tr>
              <th className="text-left px-4 py-2 dark:text-gray-100">Nome</th>
              <th className="text-left px-4 py-2 dark:text-gray-100">Categoria</th>
              <th className="text-right px-4 py-2 dark:text-gray-100">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-3 dark:text-gray-200" colSpan={3}>Carregando...</td></tr>
            ) : items.length === 0 ? (
              <tr><td className="px-4 py-3 dark:text-gray-200" colSpan={3}>Nenhum documento selecionado</td></tr>
            ) : (
              items.map((doc) => (
                <tr key={doc.id} className="border-t border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-2 dark:text-gray-100">{doc.filename}</td>
                  <td className="px-4 py-2 dark:text-gray-100">{doc.category || '-'}</td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-gray-700 hover:bg-gray-600 text-white"
                        title="Visualizar"
                        onClick={() => { setSelected(doc); setOpenView(true); }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-gray-700 hover:bg-gray-600 text-white"
                        title="Sincronizar"
                        onClick={() => handleSync(doc.id)}
                        disabled={syncingId === doc.id}
                      >
                        <RefreshCw className={`h-4 w-4 ${syncingId === doc.id ? 'animate-spin' : ''}`} />
                      </Button>
                      {isAdmin && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-gray-700 hover:bg-gray-600 text-white"
                          title="Excluir"
                          onClick={() => handleDelete(doc.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Side panel - View */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${openView ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setOpenView(false)}
      />
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 z-50 transform transition-transform duration-300 ${openView ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4">
          <h3 className="text-lg font-semibold dark:text-white">Documento</h3>
          {selected ? (
            <div className="mt-4 text-sm">
              <div className="divide-y divide-gray-200 dark:divide-gray-700 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between px-4 py-2 bg-gray-50 dark:bg-gray-700/50">
                  <span className="text-gray-400">Nome</span>
                  <span className="dark:text-gray-100 text-right ml-4 break-words">{selected.filename}</span>
                </div>
                <div className="flex items-start justify-between px-4 py-2">
                  <span className="text-gray-400">Categoria</span>
                  <span className="dark:text-gray-100 text-right ml-4 break-words">{selected.category || '—'}</span>
                </div>
                <div className="flex items-start justify-between px-4 py-2">
                  <span className="text-gray-400">Extensão</span>
                  <span className="dark:text-gray-100 text-right ml-4">{selected.file_extension || '—'}</span>
                </div>
                <div className="flex items-start justify-between px-4 py-2">
                  <span className="text-gray-400">Conta</span>
                  <span className="dark:text-gray-100 text-right ml-4 break-words">{selected.account_name || selected.account_id}</span>
                </div>
                {selected.created_at && (
                  <div className="flex items-start justify-between px-4 py-2">
                    <span className="text-gray-400">Criado em</span>
                    <span className="dark:text-gray-100 text-right ml-4">{new Date(selected.created_at).toLocaleString()}</span>
                  </div>
                )}
                {selected.updated_at && (
                  <div className="flex items-start justify-between px-4 py-2">
                    <span className="text-gray-400">Atualizado em</span>
                    <span className="dark:text-gray-100 text-right ml-4">{new Date(selected.updated_at).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex items-start justify-between px-4 py-2">
                  <span className="text-gray-400">Link</span>
                  <span className="text-right ml-4 truncate max-w-[55%]">
                    {selected.document_url ? (
                      <a className="text-blue-500 hover:underline" href={selected.document_url} target="_blank" rel="noreferrer">Abrir documento</a>
                    ) : (
                      <span className="dark:text-gray-100">—</span>
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  variant="secondary"
                  className="bg-gray-700 hover:bg-gray-600 text-white"
                  onClick={() => setOpenView(false)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm dark:text-gray-300">Nenhum documento selecionado</p>
          )}
        </div>
      </div>

      {/* Side panel - Create */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${openCreate ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setOpenCreate(false)}
      />
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 z-50 transform transition-transform duration-300 ${openCreate ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4">
          <h3 className="text-lg font-semibold dark:text-white">Incluir Documento</h3>
          <div className="mt-4 space-y-3 text-sm">
            {/* Upload - drag and drop area */}
            <div>
              <label className="block text-sm mb-1 dark:text-gray-200">Arquivo</label>
              <div
                className="w-full rounded border border-dashed dark:border-gray-600 bg-gray-50 dark:bg-gray-900/60 px-4 py-8 text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900"
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  const f = e.dataTransfer.files?.[0];
                  if (!f) return;
                  const ext = f.name.split('.').pop()?.toLowerCase() || '';
                  if (!['pdf','docx'].includes(ext)) { alert('Apenas PDF ou DOCX'); return; }
                  setFile(f);
                  setDocumentName(f.name);
                  setFileExt(`.${ext}`);
                }}
                onClick={() => {
                  const input = document.getElementById('kb-file-input') as HTMLInputElement | null;
                  input?.click();
                }}
              >
                <div className="text-gray-600 dark:text-gray-300">
                  <span className="text-blue-500">Arraste e solte</span> o arquivo aqui
                  <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">Tipos permitidos: PDF, DOCX • Tamanho máximo 25 MB</div>
                </div>
              </div>
              <input id="kb-file-input" type="file" accept=".pdf,.docx" className="hidden" onChange={(e) => {
                const f = e.target.files?.[0] || null;
                if (!f) { setFile(null); setDocumentName(''); setFileExt(''); return; }
                const ext = f.name.split('.').pop()?.toLowerCase() || '';
                if (!['pdf','docx'].includes(ext)) { alert('Apenas PDF ou DOCX'); return; }
                setFile(f);
                setDocumentName(f.name);
                setFileExt(`.${ext}`);
              }} />
              {file && (
                <div className="mt-2 text-xs dark:text-gray-300">Selecionado: {file.name}</div>
              )}
            </div>

            {/* Nome do Documento */}
            <div>
              <label className="block text-sm mb-1 dark:text-gray-200">Nome do Documento</label>
              <input
                type="text"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                className="w-full rounded border dark:bg-gray-700 dark:text-white dark:border-gray-600 px-3 py-2"
                placeholder="nome-do-arquivo.pdf"
              />
            </div>

            {/* Extensão do Arquivo */}
            <div>
              <label className="block text-sm mb-1 dark:text-gray-200">Extensão do Arquivo</label>
              <input
                type="text"
                value={fileExt}
                readOnly
                className="w-full rounded border dark:bg-gray-700 dark:text-white dark:border-gray-600 px-3 py-2 opacity-80"
                placeholder=".pdf"
              />
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4 flex justify-end gap-2">
              <Button variant="secondary" className="bg-gray-700 hover:bg-gray-600 text-white" onClick={() => { setOpenCreate(false); resetCreateForm(); }} disabled={saving}>Cancelar</Button>
              <Button className="bg-blue-600 hover:bg-blue-500 text-white" onClick={handleCreate} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
