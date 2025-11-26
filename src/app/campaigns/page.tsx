"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, ChevronLeft, ChevronRight, Users, Plus } from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";
import Sidebar from "../../components/Sidebar";
import ProductHeader from "../../components/ProductHeader";
import {
  SESSION_SELECTED_PRODUCT_ID_KEY,
  SESSION_SELECTED_ACCOUNT_BUNDLE_KEY,
} from "../../utils/sessionKeys";
// import { apiService } from "@/lib/api"; // Removido - usando fetch direto

// Types
type UserData = {
  user?: {
    id?: string;
    name: string;
    email: string;
    photoUrl?: string;
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
  const { theme } = useTheme();
  const campaigns_theme = theme.colors.campaigns;

  const [authToken, setAuthToken] = useState<string | undefined>(undefined);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [, setShowHeader] = useState(false);
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

  // CSV Import modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedCampaignForImport, setSelectedCampaignForImport] = useState<Campaign | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importSendMessages, setImportSendMessages] = useState(false);
  const [importUploading, setImportUploading] = useState(false);
  const [importResult, setImportResult] = useState<{ 
    success: boolean; 
    message?: string; 
    valid?: number; 
    invalid?: number;
    totalProcessed?: number;
    totalSaved?: number;
    totalDuplicates?: number;
    messagesSent?: number;
    validationErrors?: Array<{ lineNumber?: number; errors?: string[]; error?: string }>;
  } | null>(null);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      try { localStorage.clear(); } catch {}
      try { sessionStorage.clear(); } catch {}
    }
    router.push("/login");
  };

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

  // const saasApiUrl = process.env.NEXT_PUBLIC_SAAS_API_URL || "https://api-saas.autonomia.site";
  const leadshotApiUrl = process.env.NEXT_PUBLIC_LEADSHOT_API_URL || "https://api-leadshot.autonomia.site";
  
  // Função para criar headers dinâmicos baseados no ambiente
  const createHeaders = (authToken?: string) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Adicionar header de desenvolvimento se estiver em ambiente local
    const devEmail = process.env.NEXT_PUBLIC_DEV_EMAIL;
    if (devEmail) {
      headers['X-Dev-Email'] = devEmail;
    }
    
    // Adicionar token se disponível
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    return headers;
  };

  // Load session
  useEffect(() => {
    try {
      const stored = localStorage.getItem("userData");
      if (!stored) {
        router.push('/');
        return;
      }

      const parsed: UserData = JSON.parse(stored);
      const tokenComputed = parsed.IdToken || parsed.token || parsed.AccessToken;
      
      if (!tokenComputed) {
        router.push('/');
        return;
      }

      setUserData(parsed);
      setAuthToken(tokenComputed);

      // Buscar produtos do SaaS usando o token
      const fetchProducts = async () => {
        try {
          setProductsLoading(true);
          const saasApiUrl = process.env.NEXT_PUBLIC_SAAS_API_URL || 'https://api-saas.autonomia.site';
          const url = `${saasApiUrl}/Autonomia/Saas/Products`;
          
          const resp = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${tokenComputed}`
            },
            mode: 'cors'
          });

          if (!resp.ok) {
            console.error('[Campaigns] Falha ao buscar produtos:', resp.status, await resp.text());
            setProducts([]);
            return;
          }

          const json = await resp.json();
          const list: Product[] = Array.isArray(json?.data) ? json.data : [];
          setProducts(list);
        } catch (err) {
          console.error('[Campaigns] Erro ao buscar produtos:', err);
          setProducts([]);
        } finally {
          setProductsLoading(false);
        }
      };

      fetchProducts();
    } catch (error) {
      console.error('[Campaigns] Erro ao carregar sessão:', error);
      router.push('/');
    }
  }, [router]);

  // staged header/menu animation like Settings
  useEffect(() => {
    const t1 = setTimeout(() => setShowHeader(true), 160);
    const t2 = setTimeout(() => setShowMenu(true), 420);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = sessionStorage.getItem(SESSION_SELECTED_PRODUCT_ID_KEY);
      if (stored) setSelectedProductId(stored);
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (selectedProductId) {
        sessionStorage.setItem(SESSION_SELECTED_PRODUCT_ID_KEY, selectedProductId);
        return;
      }
      sessionStorage.removeItem(SESSION_SELECTED_PRODUCT_ID_KEY);
    } catch {}
  }, [selectedProductId]);

  // Settings-like layout uses a direct select instead of search grid

  // Load campaigns when product selected
  const loadCampaigns = async (productId: string) => {
    if (!productId) {
      setCampaigns([]);
      return;
    }
    try {
      setCampaignsLoading(true);
      const leadshotApiUrl = process.env.NEXT_PUBLIC_LEADSHOT_API_URL || 'https://api-leadshot.autonomia.site';
      const url = `${leadshotApiUrl}/Autonomia/Leadshot/Campaigns?productId=${encodeURIComponent(productId)}`;
      
      const resp = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        mode: 'cors'
      });

      if (!resp.ok) {
        console.error('[Campaigns] Falha ao buscar campanhas:', resp.status, await resp.text());
        setCampaigns([]);
        return;
      }

      const json = await resp.json();
      const list = Array.isArray(json) ? json : (json.data || json.campaigns || []);
      setCampaigns(list);
    } catch (error) {
      console.error('[Campaigns] Erro ao carregar campanhas:', error);
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
        const saasApiUrl = process.env.NEXT_PUBLIC_SAAS_API_URL || 'https://api-saas.autonomia.site';
        const url = `${saasApiUrl}/Autonomia/Saas/Accounts?productId=${encodeURIComponent(selectedProductId)}`;
        
        const resp = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
          mode: 'cors'
        });

        if (!resp.ok) {
          console.error('[Campaigns] Falha ao buscar contas:', resp.status, await resp.text());
          setAccounts([]);
          return;
        }

        const json = await resp.json();
        const list = Array.isArray(json?.data) ? json.data : [];
        const mapped: Account[] = list.map((a: { id: string; name: string }) => ({ id: a.id, name: a.name }));
        setAccounts(mapped);
        
        try {
          const storedBundle = sessionStorage.getItem(SESSION_SELECTED_ACCOUNT_BUNDLE_KEY);
          if (storedBundle) {
            const parsed = JSON.parse(storedBundle) as { productId?: string; accountId?: string } | null;
            if (parsed?.productId === selectedProductId && parsed.accountId) {
              setFormAccountId(parsed.accountId);
            }
          }
        } catch {}
      } catch (error) {
        console.error('[Campaigns] Erro ao carregar contas:', error);
        setAccounts([]);
      } finally {
        setAccountsLoading(false);
      }
    };
    loadAccounts();
  }, [selectedProductId, authToken]);

  // Load template messages when an account is chosen in the form
  useEffect(() => {
    const loadTemplates = async () => {
      if (!formAccountId) { setTemplates([]); return; }
      try {
        setTemplatesLoading(true);
        const tokenToUse = authToken || getTokenFromLocal();
        const resp = await fetch(`${leadshotApiUrl}/Autonomia/Saas/TemplateMessages?accountId=${encodeURIComponent(formAccountId)}`, {
          headers: createHeaders(tokenToUse),
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
      const leadshotApiUrl = process.env.NEXT_PUBLIC_LEADSHOT_API_URL || 'https://api-leadshot.autonomia.site';
      const url = `${leadshotApiUrl}/Autonomia/Leadshot/Campaigns`;
      
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        mode: 'cors',
        body: JSON.stringify({
          name: formName.trim(),
          description: formDescription || null,
          account_id: formAccountId,
          template_message_id: formTemplateId || null,
          product_id: selectedProductId,
        })
      });
      
      if (!resp.ok) {
        console.error('[Campaigns] Falha ao criar campanha:', resp.status, await resp.text());
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
      console.error('[Campaigns] Erro ao criar campanha:', e);
    } finally {
      setFormSaving(false);
    }
  };

  // CSV Import handlers
  const openImportModal = (campaign: Campaign) => {
    setSelectedCampaignForImport(campaign);
    setImportFile(null);
    setImportSendMessages(false);
    setImportResult(null);
    setIsImportModalOpen(true);
  };

  const closeImportModal = () => {
    setIsImportModalOpen(false);
    setSelectedCampaignForImport(null);
    setImportFile(null);
    setImportResult(null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
      if (allowedTypes.includes(file.type) || file.name.toLowerCase().endsWith('.csv') || file.name.toLowerCase().endsWith('.xlsx')) {
        setImportFile(file);
        setImportResult(null);
      } else {
        alert('Formato de arquivo não suportado. Use CSV ou XLSX.');
      }
    }
  };

  // Converter arquivo para base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1] || '';
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const submitImport = async () => {
    if (!importFile || !selectedCampaignForImport) return;
    
    try {
      setImportUploading(true);
      
      // Converter arquivo para base64
      const base64Content = await fileToBase64(importFile);

      const leadshotApiUrl = process.env.NEXT_PUBLIC_LEADSHOT_API_URL || 'https://api-leadshot.autonomia.site';
      const url = `${leadshotApiUrl}/Autonomia/Leadshot/Campaigns/${selectedCampaignForImport.id}/contacts/upload`;

      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        mode: 'cors',
        body: JSON.stringify({
          file: base64Content,
          filename: importFile.name,
          accountId: selectedCampaignForImport.account_id,
          sendMessages: importSendMessages
        })
      });

      const result = await resp.json();
      
      if (!resp.ok) {
        console.error('[Campaigns] Falha no upload:', resp.status, result);
        throw new Error(result.message || 'Erro ao fazer upload');
      }

      setImportResult(result);
      
      // Recarregar campanhas para atualizar contadores
      if (selectedProductId) {
        loadCampaigns(selectedProductId);
      }
      
    } catch (error: unknown) {
      console.error('[Campaigns] Erro no upload:', error);
      setImportResult({
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao processar arquivo'
      });
    } finally {
      setImportUploading(false);
    }
  };

  return (
    <div className={`flex h-screen ${theme.colors.background.primary} ${theme.colors.text.secondary}`}>
      {/* Sidebar */}
      <Sidebar show={showMenu} />

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <ProductHeader
          products={products}
          productsLoading={productsLoading}
          selectedProductId={selectedProductId || ''}
          isAdmin={!!userData?.user?.isAdmin}
          userName={userData?.user?.name}
          userPhotoUrl={userData?.user?.photoUrl}
          userInitials={userInitials}
          showOnboardingButton={false}
          onChangeProduct={handleSelectProduct}
          onCreateProduct={() => {}}
          onEditProduct={() => {}}
          onOpenProductSettings={() => {}}
          onLogout={handleLogout}
        />

        {/* Content */}
        <main className="flex-1 overflow-auto p-6 pt-20 ml-20">
          {selectedProductId && (
            <>
              <section className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className={`text-xl font-semibold ${theme.colors.text.primary}`}>Campanhas</h2>
                  {isAdmin && (
                    <Button
                      className={theme.colors.button.primary}
                      size="sm"
                      onClick={openCreateForm}
                      title="Incluir campanha"
                    >
                      + Incluir
                    </Button>
                  )}
                </div>
                <div className={`border rounded shadow-sm max-h-[50vh] overflow-auto ${campaigns_theme.table}`}>
                  <table className="min-w-full text-sm">
                    <thead className={`sticky top-0 ${campaigns_theme.tableHeader}`}>
                      <tr>
                        <th className={`text-left px-4 py-2 ${theme.colors.text.primary}`}>Nome</th>
                        <th className={`text-left px-4 py-2 ${theme.colors.text.primary}`}>Descrição</th>
                        <th className={`text-left px-4 py-2 ${theme.colors.text.primary}`}>Conta</th>
                        <th className={`text-left px-4 py-2 ${theme.colors.text.primary}`}>Template</th>
                        <th className={`text-left px-4 py-2 ${theme.colors.text.primary}`}>Contatos</th>
                        <th className={`text-left px-4 py-2 ${theme.colors.text.primary}`}>Criado em</th>
                        <th className={`text-left px-4 py-2 ${theme.colors.text.primary}`}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaignsLoading && (
                        <tr>
                          <td className={`px-4 py-3 ${theme.colors.text.primary}`} colSpan={7}>Carregando...</td>
                        </tr>
                      )}
                      {!campaignsLoading && campaigns.length === 0 && (
                        <tr>
                          <td className={`px-4 py-3 ${theme.colors.text.primary}`} colSpan={7}>Nenhuma campanha encontrada.</td>
                        </tr>
                      )}
                      {!campaignsLoading && campaigns.slice((campPage-1)*campPageSize, (campPage-1)*campPageSize + campPageSize).map((c) => (
                        <tr key={c.id} className={`border-t ${campaigns_theme.tableRow} ${campaigns_theme.tableRowHover}`}>
                          <td className={`px-4 py-2 font-medium ${theme.colors.text.primary}`}>{c.name}</td>
                          <td className={`px-4 py-2 ${theme.colors.text.primary}`}>{c.description || '-'}</td>
                          <td className={`px-4 py-2 ${theme.colors.text.primary}`}>{c.account_name || c.account_id}</td>
                          <td className={`px-4 py-2 ${theme.colors.text.primary}`}>{c.template_name || '-'}</td>
                          <td className={`px-4 py-2 ${theme.colors.text.primary}`}>
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span>-</span>
                            </div>
                          </td>
                          <td className={`px-4 py-2 ${theme.colors.text.primary}`}>{c.created_at ? new Date(c.created_at).toLocaleString() : '-'}</td>
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openImportModal(c)}
                                className={`p-2 rounded-lg transition-colors ${campaigns_theme.importButton}`}
                                title="Importar contatos CSV"
                                aria-label="Importar contatos CSV"
                              >
                                <Upload className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {(!campaignsLoading && campaigns.length > campPageSize) && (
                  <div className={`flex items-center justify-between px-4 py-2 border-t ${campaigns_theme.formBorder}`}>
                    <span className={`text-xs ${theme.colors.text.secondary}`}>
                      Página {campPage} de {Math.ceil(campaigns.length / campPageSize)}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        className={theme.colors.button.secondary}
                        onClick={() => setCampPage(p => Math.max(1, p-1))}
                        disabled={campPage === 1}
                      >Anterior</Button>
                      <Button
                        className={theme.colors.button.primary}
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
          className={`fixed right-0 top-0 h-full w-full max-w-md shadow-xl z-50 transform transition-transform duration-300 ease-out ${campaigns_theme.form} ${isFormOpen ? 'translate-x-0' : 'translate-x-full'}`}
          aria-hidden={!isFormOpen}
        >
          <div className={`p-4 border-b flex items-center justify-between ${campaigns_theme.formBorder}`}>
            <h2 className={`text-lg font-semibold ${theme.colors.text.primary}`}>Incluir Campanha</h2>
            <button className={`${theme.colors.text.muted} ${theme.colors.background.hover}`} onClick={cancelCreateForm} aria-label="Fechar">✕</button>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <label className={`block text-sm mb-1 ${theme.colors.text.primary}`}>Nome</label>
              <input value={formName} onChange={(e) => setFormName(e.target.value)} className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${campaigns_theme.input}`} placeholder="Nome da campanha" />
            </div>
            <div>
              <label className={`block text-sm mb-1 ${theme.colors.text.primary}`}>Descrição</label>
              <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[90px] ${campaigns_theme.input}`} placeholder="Descrição (opcional)" />
            </div>
            <div>
              <label htmlFor="acc-select" className={`block text-sm mb-1 ${theme.colors.text.primary}`}>Conta</label>
              <select
                id="acc-select"
                className={`w-full rounded-md px-3 py-2 text-sm border ${theme.colors.background.secondary} ${theme.colors.text.primary} ${theme.colors.border.secondary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                style={{
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor'%3E%3Cpath d='M4 6l4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '16px 16px',
                  paddingRight: '2.5rem'
                }}
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
              <label htmlFor="template-select" className={`block text-sm mb-1 ${theme.colors.text.primary}`}>Template de Mensagem</label>
              <div className="flex items-center gap-2">
                <select
                  id="template-select"
                  className={`w-full rounded-md px-3 py-2 text-sm border ${theme.colors.background.secondary} ${theme.colors.text.primary} ${theme.colors.border.secondary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  style={{
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor'%3E%3Cpath d='M4 6l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '16px 16px',
                    paddingRight: '2.5rem'
                  }}
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
                  className={theme.colors.button.primary}
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
          <div className={`p-4 border-t flex items-center justify-end gap-2 ${campaigns_theme.formBorder}`}>
            <Button variant="secondary" className={theme.colors.button.secondary} onClick={cancelCreateForm} disabled={formSaving}>Cancelar</Button>
            <Button className={theme.colors.button.primary} onClick={submitCreateCampaign} disabled={formSaving || !formName.trim() || !formAccountId}>Salvar</Button>
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
          className={`fixed right-0 top-0 h-full w-full max-w-md shadow-xl z-50 transform transition-transform duration-300 ease-out ${campaigns_theme.form} ${isTemplateFormOpen ? 'translate-x-0' : 'translate-x-full'}`}
          aria-hidden={!isTemplateFormOpen}
        >
          <div className={`p-4 border-b flex items-center justify-between ${campaigns_theme.formBorder}`}>
            <h2 className={`text-lg font-semibold ${theme.colors.text.primary}`}>Incluir Template</h2>
            <button className={`${theme.colors.text.muted} ${theme.colors.background.hover}`} onClick={() => setIsTemplateFormOpen(false)} aria-label="Fechar">✕</button>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <label className={`block text-sm mb-1 ${theme.colors.text.primary}`}>Conta</label>
              <input className={`w-full rounded border px-3 py-2 text-sm ${campaigns_theme.inputDisabled}`} value={accounts.find(a => a.id === formAccountId)?.name || ''} disabled />
            </div>
            <div>
              <label className={`block text-sm mb-1 ${theme.colors.text.primary}`}>Nome do Template</label>
              <input value={tmplName} onChange={(e) => setTmplName(e.target.value)} className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${campaigns_theme.input}`} placeholder="Ex.: Boas-vindas" />
            </div>
            <div>
              <label className={`block text-sm mb-1 ${theme.colors.text.primary}`}>Mensagem</label>
              <textarea value={tmplText} onChange={(e) => setTmplText(e.target.value)} className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] ${campaigns_theme.input}`} placeholder="Digite o texto da mensagem" />
            </div>
          </div>
          <div className={`p-4 border-t flex items-center justify-end gap-2 ${campaigns_theme.formBorder}`}>
            <Button
              variant="secondary"
              className={theme.colors.button.secondary}
              onClick={() => setIsTemplateFormOpen(false)}
              disabled={tmplSaving}
            >Cancelar</Button>
            <Button
              className={theme.colors.button.primary}
              disabled={tmplSaving || !tmplName.trim() || !tmplText.trim() || !formAccountId}
              onClick={async () => {
                try {
                  setTmplSaving(true);
                  const tokenToUse = authToken || getTokenFromLocal();
                  const resp = await fetch(`${leadshotApiUrl}/Autonomia/Saas/TemplateMessages`, {
                    method: 'POST',
                    headers: createHeaders(tokenToUse),
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

        {/* CSV Import Modal */}
        {/* Overlay */}
        <div
          className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isImportModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={closeImportModal}
        />
        {/* Panel */}
        <div
          className={`fixed right-0 top-0 h-full w-full max-w-lg shadow-xl z-50 transform transition-transform duration-300 ease-out ${campaigns_theme.modal} ${isImportModalOpen ? 'translate-x-0' : 'translate-x-full'}`}
          aria-hidden={!isImportModalOpen}
        >
          <div className={`p-4 border-b flex items-center justify-between ${campaigns_theme.modalBorder}`}>
            <h2 className={`text-lg font-semibold ${theme.colors.text.primary}`}>
              Importar Contatos - {selectedCampaignForImport?.name}
            </h2>
            <button 
              className={`${theme.colors.text.muted} ${theme.colors.background.hover}`}
              onClick={closeImportModal} 
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            {!importResult && (
              <>
                <div>
                  <label className={`block text-sm mb-1 ${theme.colors.text.primary}`}>Arquivo CSV/XLSX</label>
                  <div
                    className={`w-full rounded border border-dashed px-4 py-8 text-center cursor-pointer ${campaigns_theme.input} ${theme.colors.background.hover}`}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const f = e.dataTransfer.files?.[0];
                      if (!f) return;
                      const ext = f.name.split('.').pop()?.toLowerCase() || '';
                      if (!['csv','xlsx','xls'].includes(ext)) { alert('Apenas CSV, XLSX ou XLS'); return; }
                      setImportFile(f);
                    }}
                    onClick={() => {
                      const input = document.getElementById('import-file-input') as HTMLInputElement | null;
                      input?.click();
                    }}
                  >
                    <div className={theme.colors.text.secondary}>
                      <span className="text-blue-500">Arraste e solte</span> o arquivo aqui
                      <div className={`text-xs mt-1 ${theme.colors.text.muted}`}>Tipos permitidos: CSV, XLSX, XLS • Tamanho máximo 25 MB</div>
                    </div>
                  </div>
                  <input 
                    id="import-file-input" 
                    type="file" 
                    accept=".csv,.xlsx,.xls" 
                    className="hidden" 
                    onChange={handleFileSelect}
                  />
                  {importFile && (
                    <div className={`mt-2 text-xs ${theme.colors.text.primary}`}>Selecionado: {importFile.name}</div>
                  )}
                </div>

                <div className={`p-3 rounded-md ${theme.colors.accent.primary}`}>
                  <h4 className="text-sm font-medium mb-2">
                    Formato esperado do arquivo:
                  </h4>
                  <ul className="text-xs space-y-1">
                    <li>• <strong>Nome:</strong> Nome completo do contato</li>
                    <li>• <strong>Telefone:</strong> Número com DDD (ex: 11999999999)</li>
                    <li>• <strong>CPF:</strong> CPF válido (com ou sem formatação)</li>
                    <li>• Outras colunas serão salvas como dados extras</li>
                  </ul>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="sendMessages"
                    checked={importSendMessages}
                    onChange={(e) => setImportSendMessages(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="sendMessages" className={`text-sm ${theme.colors.text.primary}`}>
                    Enviar mensagens automaticamente após importação
                  </label>
                </div>
              </>
            )}

            {importResult && (
              <div className={`p-4 rounded-md ${importResult.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                <h4 className={`font-medium ${importResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                  {importResult.success ? 'Importação Concluída!' : 'Erro na Importação'}
                </h4>
                <p className={`text-sm mt-1 ${importResult.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                  {importResult.message}
                </p>
                
                {importResult.success && (
                  <div className="mt-3 text-sm text-green-700 dark:text-green-300">
                    <p>• Contatos processados: {importResult.totalProcessed || 0}</p>
                    <p>• Contatos salvos: {importResult.totalSaved || 0}</p>
                    <p>• Duplicatas: {importResult.totalDuplicates || 0}</p>
                    {importResult.messagesSent && (
                      <p>• Mensagens enviadas: {importResult.messagesSent}</p>
                    )}
                  </div>
                )}

                {importResult.validationErrors && importResult.validationErrors.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Erros encontrados:
                    </p>
                    <div className="max-h-32 overflow-y-auto mt-1">
                      {importResult.validationErrors.slice(0, 5).map((error: { lineNumber?: number; errors?: string[]; error?: string }, index: number) => (
                        <p key={index} className="text-xs text-yellow-700 dark:text-yellow-300">
                          Linha {error.lineNumber}: {Array.isArray(error.errors) ? error.errors.join(', ') : error.error}
                        </p>
                      ))}
                      {importResult.validationErrors.length > 5 && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">
                          ... e mais {importResult.validationErrors.length - 5} erros
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={`p-4 border-t flex items-center justify-end gap-2 ${campaigns_theme.modalBorder}`}>
            <Button 
              variant="secondary" 
              className={theme.colors.button.secondary}
              onClick={closeImportModal}
              disabled={importUploading}
            >
              {importResult ? 'Fechar' : 'Cancelar'}
            </Button>
            {!importResult && (
              <Button 
                className="bg-green-600 hover:bg-green-500 text-white" 
                onClick={submitImport}
                disabled={importUploading || !importFile}
              >
                {importUploading ? 'Processando...' : 'Importar'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
