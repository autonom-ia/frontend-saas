"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus } from "lucide-react";
import Sidebar from "../../components/Sidebar";

// Types
type UserData = {
  user?: {
    id?: string;
    name: string;
    email: string;
    isAdmin?: boolean;
  };
  token?: string;
  IdToken?: string;
  AccessToken?: string;
  isAuthenticated?: boolean;
};

type Product = {
  id: string;
  name: string;
  description?: string;
};

type Campaign = {
  id: string;
  name: string;
  description?: string;
  template_message_id?: string;
  account_id: string;
  created_at?: string;
  account_name?: string;
  template_name?: string;
};

export default function CampaignsPage() {
  const router = useRouter();

  const [authToken, setAuthToken] = useState<string | undefined>(undefined);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showHeader, setShowHeader] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>("");

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [campPage, setCampPage] = useState(1);
  const campPageSize = 10;

  // Accounts for selected product (to create campaign)
  type Account = { id: string; name: string };
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);

  // Template messages for selected account (form)
  type TemplateMessage = { id: string; name: string };
  const [templates, setTemplates] = useState<TemplateMessage[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);

  // Slide-over form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formAccountId, setFormAccountId] = useState("");
  const [formTemplateId, setFormTemplateId] = useState("");
  const [formSaving, setFormSaving] = useState(false);

  // Template create slide-over state
  const [isTemplateFormOpen, setIsTemplateFormOpen] = useState(false);
  const [tmplName, setTmplName] = useState("");
  const [tmplText, setTmplText] = useState("");
  const [tmplSaving, setTmplSaving] = useState(false);

  // Helpers
  const getTokenFromLocal = (): string | undefined => {
    try {
      const stored = localStorage.getItem("userData");
      if (!stored) return undefined;
      const parsed = JSON.parse(stored) as UserData;
      return parsed.IdToken || parsed.token || parsed.AccessToken;
    } catch {
      return undefined;
    }
  };

  const isAdmin = !!userData?.user?.isAdmin;

  const userInitials = useMemo(() => {
    const n = userData?.user?.name || "Usuário";
    return n.split(" ").map((p) => p[0]).join("").toUpperCase().substring(0,2);
  }, [userData?.user?.name]);

  const saasApiUrl = process.env.NEXT_PUBLIC_SAAS_API_URL || "https://api-saas.autonomia.site";
  const leadshotApiUrl = process.env.NEXT_PUBLIC_LEADSHOT_API_URL || "https://api-leadshot.autonomia.site";

  // Load session
  useEffect(() => {
    try {
      const stored = localStorage.getItem("userData");
      if (stored) {
        const parsed: UserData = JSON.parse(stored);
        if (!parsed?.isAuthenticated) { router.push('/login'); return; }
        setUserData(parsed);
      } else { router.push('/login'); return; }
    } catch { router.push('/login'); return; }
    setAuthToken((prev) => prev || getTokenFromLocal());
  }, [router]);

  // staged header/menu animation like Settings
  useEffect(() => {
    const t1 = setTimeout(() => setShowHeader(true), 160);
    const t2 = setTimeout(() => setShowMenu(true), 420);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Load products once
  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      const resp = await fetch(`${saasApiUrl}/Autonomia/Saas/Products`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
        mode: "cors",
      });
      if (!resp.ok) {
        console.error("Falha ao listar produtos", resp.status, resp.statusText);
        setProducts([]);
        return;
      }
      const json = await resp.json();
      const list = Array.isArray(json?.data) ? (json.data as Product[]) : [];
      setProducts(list);
    } catch (e) {
      console.error("Erro ao carregar produtos", e);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    if (!authToken) return; // aguarda token para evitar 401
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken]);

  // Settings-like layout uses a direct select instead of search grid

  // Load campaigns when product selected
  const loadCampaigns = async (productId: string) => {
    if (!productId) {
      setCampaigns([]);
      return;
    }
    try {
      setCampaignsLoading(true);
      const resp = await fetch(`${leadshotApiUrl}/Autonomia/Leadshot/Campaigns?productId=${encodeURIComponent(productId)}`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
        mode: "cors",
      });
      if (!resp.ok) {
        const t = await resp.text();
        console.error("Falha ao listar campanhas:", resp.status, resp.statusText, t);
        setCampaigns([]);
        return;
      }
      const json = await resp.json();
      const list = Array.isArray(json?.data) ? (json.data as Campaign[]) : [];
      setCampaigns(list);
    } catch (e) {
      console.error("Erro ao carregar campanhas", e);
      setCampaigns([]);
    } finally {
      setCampaignsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProductId) loadCampaigns(selectedProductId);
    else setCampaigns([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProductId, authToken]);

  // Load accounts for selected product (for form)
  useEffect(() => {
    const loadAccounts = async () => {
      if (!selectedProductId) { setAccounts([]); return; }
      try {
        setAccountsLoading(true);
        const tokenToUse = authToken || getTokenFromLocal();
        const resp = await fetch(`${saasApiUrl}/Autonomia/Saas/Accounts?productId=${encodeURIComponent(selectedProductId)}`, {
          headers: tokenToUse ? { Authorization: `Bearer ${tokenToUse}` } : undefined,
          mode: 'cors',
        });
        if (!resp.ok) { setAccounts([]); return; }
        const json = await resp.json();
        const list = (Array.isArray(json?.data) ? json.data : []) as Array<{ id: string; name: string }>;
        const mapped: Account[] = list.map((a: { id: string; name: string }) => ({ id: a.id, name: a.name }));
        setAccounts(mapped);
      } catch {
        setAccounts([]);
      } finally {
        setAccountsLoading(false);
      }
    };
    loadAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProductId, authToken]);

  // Load template messages when an account is chosen in the form
  useEffect(() => {
    const loadTemplates = async () => {
      if (!formAccountId) { setTemplates([]); return; }
      try {
        setTemplatesLoading(true);
        const tokenToUse = authToken || getTokenFromLocal();
        const resp = await fetch(`${leadshotApiUrl}/Autonomia/Leadshot/TemplateMessages?accountId=${encodeURIComponent(formAccountId)}`, {
          headers: tokenToUse ? { Authorization: `Bearer ${tokenToUse}` } : undefined,
          mode: 'cors',
        });
        if (!resp.ok) { setTemplates([]); return; }
        const json = await resp.json();
        const list = (Array.isArray(json?.data) ? json.data : []) as Array<{ id: string; name: string }>;
        const mapped: TemplateMessage[] = list.map((t: { id: string; name: string }) => ({ id: t.id, name: t.name }));
        setTemplates(mapped);
      } catch {
        setTemplates([]);
      } finally {
        setTemplatesLoading(false);
      }
    };
    loadTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formAccountId, authToken]);

  // UI handlers
  const handleSelectProduct = (id: string) => setSelectedProductId(id);

  const openCreateForm = () => {
    if (!isAdmin) return;
    setFormName("");
    setFormDescription("");
    setFormAccountId("");
    setFormTemplateId("");
    setIsFormOpen(true);
  };

  const cancelCreateForm = () => {
    setIsFormOpen(false);
  };

  const submitCreateCampaign = async () => {
    if (!isAdmin) return;
    if (!formName.trim() || !formAccountId) return;
    try {
      setFormSaving(true);
      const tokenToUse = authToken || getTokenFromLocal();
      const resp = await fetch(`${leadshotApiUrl}/Autonomia/Leadshot/Campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(tokenToUse ? { Authorization: `Bearer ${tokenToUse}` } : {}) },
        mode: 'cors',
        body: JSON.stringify({ name: formName.trim(), description: formDescription || null, account_id: formAccountId, template_message_id: formTemplateId || null })
      });
      if (!resp.ok) {
        console.error('Falha ao criar campanha', resp.status, await resp.text());
        return;
      }
      const json = await resp.json();
      const created: Campaign | undefined = json?.data;
      if (created?.id) {
        // Enriquecer com nomes para exibir imediatamente no grid
        const acc = accounts.find(a => a.id === formAccountId);
        const tmpl = templates.find(t => t.id === formTemplateId);
        const createdCampaign: Campaign = {
          ...created,
          account_name: acc?.name,
          template_name: tmpl?.name,
        };
        setCampaigns(prev => [createdCampaign, ...prev]);
        setCampPage(1);
        setIsFormOpen(false);
      }
    } catch (e) {
      console.error('Erro ao criar campanha', e);
    } finally {
      setFormSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-background dark:bg-gray-900 text-neutral-200">
      {/* Sidebar */}
      <Sidebar show={showMenu} />

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Fixed header like Settings */}
        <header className={`fixed top-0 left-0 right-0 z-[60] flex items-center h-16 bg-gray-800 text-white px-4 transition-all duration-400 ease-out ${showHeader ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}`}>
          {/* Logo */}
          <div className="px-2 flex items-center">
            <Image src="/images/logo.png" alt="Autonom.ia Logo" width={28} height={28} />
          </div>
          {/* Product select */}
          <div className="flex-1 px-2">
            <div className="max-w-xl flex items-center gap-2">
              <select
                id="products-select"
                className="select-clean w-full"
                disabled={productsLoading}
                value={selectedProductId || ""}
                onChange={(e) => handleSelectProduct(e.target.value)}
              >
                <option value="" disabled>
                  {productsLoading ? 'Carregando...' : 'Selecione um produto'}
                </option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <Button variant="secondary" className="bg-gray-700 hover:bg-gray-600 text-white" onClick={() => loadProducts()} title="Atualizar produtos">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {/* Right user info */}
          <div className="flex items-center gap-2">
            <span className="text-sm hidden sm:inline">{userData?.user?.name || 'Usuário'}</span>
            <div className="h-8 w-8 rounded-full bg-white/20 text-white flex items-center justify-center text-xs">{userInitials}</div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6 pt-20 ml-20">
          {selectedProductId && (
            <>
              <section className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-semibold dark:text-white">Campanhas</h2>
                  {isAdmin && (
                    <Button
                      className="bg-blue-600 hover:bg-blue-500 text-white"
                      size="sm"
                      onClick={openCreateForm}
                      title="Incluir campanha"
                    >
                      Incluir
                    </Button>
                  )}
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm max-h-[50vh] overflow-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                      <tr>
                        <th className="text-left px-4 py-2 dark:text-gray-100">Nome</th>
                        <th className="text-left px-4 py-2 dark:text-gray-100">Descrição</th>
                        <th className="text-left px-4 py-2 dark:text-gray-100">Account</th>
                        <th className="text-left px-4 py-2 dark:text-gray-100">Template</th>
                        <th className="text-left px-4 py-2 dark:text-gray-100">Criado em</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaignsLoading && (
                        <tr>
                          <td className="px-4 py-3 dark:text-gray-200" colSpan={4}>Carregando...</td>
                        </tr>
                      )}
                      {!campaignsLoading && campaigns.length === 0 && (
                        <tr>
                          <td className="px-4 py-3 dark:text-gray-200" colSpan={4}>Nenhuma campanha encontrada.</td>
                        </tr>
                      )}
                      {!campaignsLoading && campaigns.slice((campPage-1)*campPageSize, (campPage-1)*campPageSize + campPageSize).map((c) => (
                        <tr key={c.id} className="border-t border-gray-100 dark:border-gray-700">
                          <td className="px-4 py-2 dark:text-gray-100">{c.name}</td>
                          <td className="px-4 py-2 dark:text-gray-100">{c.description || '-'}</td>
                          <td className="px-4 py-2 dark:text-gray-100">{c.account_name || c.account_id}</td>
                          <td className="px-4 py-2 dark:text-gray-100">{c.template_name || '-'}</td>
                          <td className="px-4 py-2 dark:text-gray-100">{c.created_at ? new Date(c.created_at).toLocaleString() : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {(!campaignsLoading && campaigns.length > campPageSize) && (
                  <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-xs dark:text-gray-300">
                      Página {campPage} de {Math.ceil(campaigns.length / campPageSize)}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        className="bg-gray-700 hover:bg-gray-600 text-white"
                        onClick={() => setCampPage(p => Math.max(1, p-1))}
                        disabled={campPage === 1}
                      >Anterior</Button>
                      <Button
                        className="bg-blue-600 hover:bg-blue-500 text-white"
                        onClick={() => setCampPage(p => Math.min(Math.ceil(campaigns.length / campPageSize), p+1))}
                        disabled={campPage >= Math.ceil(campaigns.length / campPageSize)}
                      >Próxima</Button>
                    </div>
                  </div>
                )}
                {/* Loading handled inside table to preserve grid shape */}
              </section>
            </>
          )}
        </main>

        {/* Slide-over Create Campaign Form */}
        {/* Overlay */}
        <div
          className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isFormOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={cancelCreateForm}
        />
        {/* Panel */}
        <div
          className={`fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-out ${isFormOpen ? 'translate-x-0' : 'translate-x-full'}`}
          aria-hidden={!isFormOpen}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold dark:text-white">Incluir Campanha</h2>
            <button className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white" onClick={cancelCreateForm} aria-label="Fechar">✕</button>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <label className="block text-sm mb-1 dark:text-gray-200">Nome</label>
              <input value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nome da campanha" />
            </div>
            <div>
              <label className="block text-sm mb-1 dark:text-gray-200">Descrição</label>
              <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[90px]" placeholder="Descrição (opcional)" />
            </div>
            <div>
              <label htmlFor="acc-select" className="block text-sm mb-1 dark:text-gray-200">Conta</label>
              <select
                id="acc-select"
                className="select-clean w-full"
                disabled={accountsLoading}
                value={formAccountId}
                onChange={(e) => setFormAccountId(e.target.value)}
              >
                <option value="" disabled>
                  {accountsLoading ? 'Carregando contas...' : 'Selecione uma conta'}
                </option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="template-select" className="block text-sm mb-1 dark:text-gray-200">Template de Mensagem</label>
              <div className="flex items-center gap-2">
                <select
                  id="template-select"
                  className="select-clean w-full"
                  disabled={templatesLoading || !formAccountId}
                  value={formTemplateId}
                  onChange={(e) => setFormTemplateId(e.target.value)}
                >
                  <option value="" disabled>
                    {templatesLoading ? 'Carregando templates...' : (!formAccountId ? 'Selecione uma conta primeiro' : 'Selecione um template (opcional)')}
                  </option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <Button
                  type="button"
                  className="bg-blue-600 hover:bg-blue-500 text-white"
                  size="sm"
                  disabled={!formAccountId}
                  title="Incluir novo template"
                  onClick={() => { setTmplName(""); setTmplText(""); setIsTemplateFormOpen(true); }}
                >
                  <Plus className="w-4 h-4 mr-1" /> Incluir
                </Button>
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
            <Button variant="secondary" className="bg-gray-700 hover:bg-gray-600 text-white" onClick={cancelCreateForm} disabled={formSaving}>Cancelar</Button>
            <Button className="bg-blue-600 hover:bg-blue-500 text-white" onClick={submitCreateCampaign} disabled={formSaving || !formName.trim() || !formAccountId}>Salvar</Button>
          </div>
        </div>

        {/* Slide-over Create Template Form */}
        {/* Overlay */}
        <div
          className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isTemplateFormOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setIsTemplateFormOpen(false)}
        />
        {/* Panel */}
        <div
          className={`fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-out ${isTemplateFormOpen ? 'translate-x-0' : 'translate-x-full'}`}
          aria-hidden={!isTemplateFormOpen}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold dark:text-white">Incluir Template</h2>
            <button className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white" onClick={() => setIsTemplateFormOpen(false)} aria-label="Fechar">✕</button>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <label className="block text-sm mb-1 dark:text-gray-200">Conta</label>
              <input className="w-full rounded border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 px-3 py-2 text-sm text-gray-500 dark:text-gray-300" value={accounts.find(a => a.id === formAccountId)?.name || ''} disabled />
            </div>
            <div>
              <label className="block text-sm mb-1 dark:text-gray-200">Nome do Template</label>
              <input value={tmplName} onChange={(e) => setTmplName(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex.: Boas-vindas" />
            </div>
            <div>
              <label className="block text-sm mb-1 dark:text-gray-200">Mensagem</label>
              <textarea value={tmplText} onChange={(e) => setTmplText(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]" placeholder="Digite o texto da mensagem" />
            </div>
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              className="bg-gray-700 hover:bg-gray-600 text-white"
              onClick={() => setIsTemplateFormOpen(false)}
              disabled={tmplSaving}
            >Cancelar</Button>
            <Button
              className="bg-blue-600 hover:bg-blue-500 text-white"
              disabled={tmplSaving || !tmplName.trim() || !tmplText.trim() || !formAccountId}
              onClick={async () => {
                try {
                  setTmplSaving(true);
                  const tokenToUse = authToken || getTokenFromLocal();
                  const resp = await fetch(`${leadshotApiUrl}/Autonomia/Leadshot/TemplateMessages`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...(tokenToUse ? { Authorization: `Bearer ${tokenToUse}` } : {}) },
                    mode: 'cors',
                    body: JSON.stringify({ account_id: formAccountId, name: tmplName.trim(), message_text: tmplText })
                  });
                  if (!resp.ok) {
                    console.error('Falha ao criar template', resp.status, await resp.text());
                    return;
                  }
                  const json = await resp.json();
                  const created = json?.data as { id: string; name: string } | undefined;
                  if (created?.id) {
                    // Atualiza lista de templates e seleciona o novo
                    setTemplates(prev => [{ id: created.id, name: created.name }, ...prev]);
                    setFormTemplateId(created.id);
                    setIsTemplateFormOpen(false);
                  }
                } catch (e) {
                  console.error('Erro ao criar template', e);
                } finally {
                  setTmplSaving(false);
                }
              }}
            >Salvar</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
