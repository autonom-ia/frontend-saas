"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Sidebar from "../../components/Sidebar";
import ProductHeader from "../../components/ProductHeader";
import SelectedAccountBar from "../../components/SelectedAccountBar";
import { Button } from "@/components/ui/button";

// Types reused in a lightweight way
type UserData = {
  user?: {
    id?: string;
    name: string;
    email: string;
    photoUrl?: string;
    isAdmin?: boolean;
  };
  isAuthenticated?: boolean;
};

type Product = { id: string; name: string; description?: string };

type Account = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  domain?: string;
  conversation_funnel_id?: string;
};

export default function KanbanPage() {
  // UI staged entrance
  const [showHeader, setShowHeader] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setShowHeader(true), 160);
    const t2 = setTimeout(() => setShowMenu(true), 420);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Auth/user
  const [userData, setUserData] = useState<UserData | null>(null);
  const [authToken, setAuthToken] = useState<string | undefined>(undefined);
  useEffect(() => {
    try {
      const stored = localStorage.getItem("userData");
      if (stored) setUserData(JSON.parse(stored));
    } catch {}
    try {
      const stored = localStorage.getItem("userData");
      if (stored) {
        const parsed = JSON.parse(stored);
        setAuthToken(parsed.IdToken || parsed.token || parsed.AccessToken);
      }
    } catch {}
  }, []);

  // Products
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const saasApiUrl = useMemo(() => process.env.NEXT_PUBLIC_SAAS_API_URL || "https://api-saas.autonomia.site", []);
  useEffect(() => {
    (async () => {
      try {
        setProductsLoading(true);
        const resp = await fetch(`${saasApiUrl}/Autonomia/Saas/Products`, {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
          mode: "cors",
        });
        if (resp.ok) {
          const j = await resp.json();
          setProducts(Array.isArray(j?.data) ? j.data : []);
        } else {
          setProducts([]);
        }
      } catch {
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    })();
  }, [saasApiUrl, authToken]);

  // Accounts of selected product
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  useEffect(() => {
    (async () => {
      if (!selectedProductId) { setAccounts([]); setSelectedAccountId(""); return; }
      try {
        setAccountsLoading(true);
        const resp = await fetch(`${saasApiUrl}/Autonomia/Saas/Accounts?productId=${encodeURIComponent(selectedProductId)}`, {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
          mode: "cors",
        });
        if (resp.ok) {
          const j = await resp.json();
          setAccounts(Array.isArray(j?.data) ? j.data : []);
        } else {
          setAccounts([]);
        }
      } catch {
        setAccounts([]);
      } finally {
        setAccountsLoading(false);
      }
    })();
  }, [selectedProductId, saasApiUrl, authToken]);

  // Kanban: load items when account selected
  type TagType = string | { name?: string; key?: string };
  type KanbanItem = Record<string, unknown> & {
    id?: string | number;
    title?: string;
    name?: string;
    summary?: string;
    description?: string;
    status?: string;
    priority?: string;
    unread_count?: number;
    created_at?: string;
    updated_at?: string;
    step_key?: string;
    step_id?: string;
    step?: { key?: string; name?: string; id?: string };
    tags?: Array<TagType>;
    contact_name?: string;
    ticket_number?: string | number;
  };
  const [kanbanLoading, setKanbanLoading] = useState(false);
  const [kanbanError, setKanbanError] = useState<string>("");
  const [kanbanItems, setKanbanItems] = useState<KanbanItem[]>([]);

  // Discover base URL for funnel API
  const funnelApiUrl = useMemo(() => {
    return (
      process.env.NEXT_PUBLIC_FUNNEL_API_URL ||
      process.env.NEXT_PUBLIC_SAAS_API_URL ||
      process.env.NEXT_PUBLIC_PROJECT_API_URL ||
      "https://api-projects.autonomia.site"
    );
  }, []);

  useEffect(() => {
    (async () => {
      if (!selectedAccountId) { setKanbanItems([]); return; }
      try {
        setKanbanLoading(true);
        setKanbanError("");
        // Try common paths
        const candidates = [
          `${funnelApiUrl}/Autonomia/Funnel/KanbanItems?accountId=${encodeURIComponent(selectedAccountId)}`,
        ];
        let lastError: string | null = null;
        for (const url of candidates) {
          try {
            const resp = await fetch(url, {
              headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
              mode: "cors",
            });
            if (!resp.ok) { lastError = `${resp.status} ${resp.statusText}`; continue; }
            const j = await resp.json();
            const data = Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : [];
            setKanbanItems(data as KanbanItem[]);
            lastError = null;
            break;
          } catch (err: unknown) {
            const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message?: unknown }).message) : String(err);
            lastError = msg;
          }
        }
        if (lastError) {
          setKanbanItems([]);
          setKanbanError(`Falha ao carregar Kanban: ${lastError}`);
        }
      } catch (e: unknown) {
        const msg = e && typeof e === 'object' && 'message' in e ? String((e as { message?: unknown }).message) : 'Erro ao carregar Kanban';
        setKanbanError(msg);
        setKanbanItems([]);
      } finally {
        setKanbanLoading(false);
      }
    })();
  }, [selectedAccountId, authToken, funnelApiUrl]);

  // Group items by column (step)
  type Column = { key: string; title: string; items: KanbanItem[] };
  const columns: Column[] = useMemo(() => {
    const groups = new Map<string, Column>();
    for (const it of kanbanItems) {
      const key = (it.step_key || it.step?.key || it.step_id || it.status || 'sem_etapa') as string;
      const title = (it.step?.name || key) as string;
      if (!groups.has(key)) groups.set(key, { key, title, items: [] });
      groups.get(key)!.items.push(it);
    }
    // Sort items by updated_at desc
    for (const col of groups.values()) {
      col.items.sort((a, b) => {
        const da = new Date(a.updated_at || a.created_at || 0).getTime();
        const db = new Date(b.updated_at || b.created_at || 0).getTime();
        return db - da;
      });
    }
    // Return alphabetical columns for now
    return Array.from(groups.values()).sort((a, b) => a.title.localeCompare(b.title));
  }, [kanbanItems]);

  const formatSince = (iso?: string) => {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / (1000*60*60*24));
    if (days > 0) return `${days} dias`;
    const hours = Math.floor(diff / (1000*60*60));
    if (hours > 0) return `${hours} h`;
    const mins = Math.floor(diff / (1000*60));
    return `${mins} min`;
  };

  // Derive initials for header avatar (same pattern as other pages)
  const userInitials = userData?.user?.name
    ? userData.user.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
    : "??";

  return (
    <div className="flex h-screen bg-background dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar show={showMenu} />

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Fixed header (match ProductHeader usage) */}
        <header className={`fixed top-0 left-0 right-0 z-[60] flex items-center h-16 bg-gray-800 text-white px-4 transition-all duration-400 ease-out ${showHeader ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}`}>
          {/* Logo */}
          <div className="px-2 flex items-center">
            <Image src="/images/logo.png" alt="Autonom.ia Logo" width={28} height={28} />
          </div>
          {/* ProductHeader inline consumer */}
          <div className="flex-1 px-2">
            <ProductHeader
              products={products}
              productsLoading={productsLoading}
              selectedProductId={selectedProductId}
              isAdmin={!!userData?.user?.isAdmin}
              userName={userData?.user?.name}
              userPhotoUrl={userData?.user?.photoUrl}
              userInitials={userInitials}
              onChangeProduct={(val) => { setSelectedProductId(val); setSelectedAccountId(""); }}
              onCreateProduct={() => { /* could open modal in future */ }}
              onEditProduct={() => { /* noop here */ }}
              onOpenProductSettings={() => { /* noop here */ }}
            />
          </div>
          {/* Right user info (optional) */}
          <div className="flex items-center gap-2">
            <span className="text-sm hidden sm:inline">{userData?.user?.name || 'Usuário'}</span>
            <div className="h-8 w-8 rounded-full bg-white/20 text-white flex items-center justify-center text-xs">{userInitials}</div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 pt-20 ml-20">
          {/* Selected Account bar */}
          {selectedProductId && selectedAccountId && (
            <SelectedAccountBar
              name={accounts.find(a => a.id === selectedAccountId)?.name || 'Conta'}
              isAdmin={!!userData?.user?.isAdmin}
              onEdit={() => { /* future: open account edit */ }}
              onInbox={() => { /* future: open inbox panel */ }}
              onSettings={() => { /* future: open account settings */ }}
              onChangeAccount={() => setSelectedAccountId("")}
            />
          )}
          {selectedProductId && selectedAccountId && (<div className="h-6" />)}

          {/* Accounts picker grid (if no account selected) */}
          {selectedProductId && !selectedAccountId && (
            <section className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold dark:text-white">Selecione a conta</h2>
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm max-h-[50vh] overflow-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                    <tr>
                      <th className="text-left px-4 py-2 dark:text-gray-100">Nome</th>
                      <th className="text-left px-4 py-2 dark:text-gray-100">Email</th>
                      <th className="text-left px-4 py-2 dark:text-gray-100">Telefone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accountsLoading ? (
                      <tr><td className="px-4 py-3 dark:text-gray-200" colSpan={3}>Carregando...</td></tr>
                    ) : accounts.length === 0 ? (
                      <tr><td className="px-4 py-3 dark:text-gray-200" colSpan={3}>Nenhuma conta encontrada.</td></tr>
                    ) : (
                      accounts.map(acc => (
                        <tr
                          key={acc.id}
                          className={`border-t border-gray-100 dark:border-gray-700 cursor-pointer ${selectedAccountId === acc.id ? 'bg-blue-50 dark:bg-gray-700/50' : ''}`}
                          onClick={() => setSelectedAccountId(acc.id)}
                        >
                          <td className="px-4 py-2 dark:text-gray-100">{acc.name}</td>
                          <td className="px-4 py-2 dark:text-gray-100">{acc.email || '-'}</td>
                          <td className="px-4 py-2 dark:text-gray-100">{acc.phone || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Kanban board with API data */}
          {selectedProductId && selectedAccountId && (
            <section className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold dark:text-white">Kanban</h2>
                <div className="text-sm text-neutral-400">
                  {kanbanLoading ? 'Carregando…' : kanbanError ? kanbanError : `${kanbanItems.length} itens`}
                </div>
              </div>

              {/* Empty state */}
              {!kanbanLoading && !kanbanError && columns.length === 0 && (
                <div className="text-sm text-neutral-400">Nenhum item encontrado para esta conta.</div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {columns.map((col) => (
                  <div key={col.key} className="rounded-lg border border-neutral-800/60 bg-neutral-900/40">
                    <div className="px-4 py-3 border-b border-neutral-800/60 flex items-center justify-between">
                      <div className="text-sm font-medium lowercase tracking-wide">{col.title}</div>
                      <div className="text-xs text-neutral-400">{col.items.length}</div>
                    </div>
                    <div className="p-3 space-y-3">
                      {col.items.map((it: KanbanItem) => {
                        const id = String(it.id ?? it.ticket_number ?? Math.random());
                        const title = it.title || it.name || it.contact_name || `Item ${id}`;
                        const summary = it.summary || it.description || '';
                        const status = it.status || 'Aberto';
                        const priority = it.priority || '';
                        const unread = typeof it.unread_count === 'number' ? it.unread_count : undefined;
                        const tags = Array.isArray(it.tags) ? it.tags : [];
                        const since = formatSince(it.updated_at || it.created_at);
                        const safeTags = (tags as TagType[])
                          .map((t) => typeof t === 'string' ? t : (t?.name || t?.key))
                          .filter((v): v is string => Boolean(v));
                        return (
                          <div key={id} className="rounded-md border border-neutral-800/60 bg-neutral-900/60 p-3">
                            <div className="flex items-start justify-between">
                              <div className="text-sm font-semibold text-white truncate max-w-[70%]" title={title}>{title}</div>
                              <span className="text-[11px] text-neutral-300 bg-neutral-800 rounded px-2 py-0.5">{status}</span>
                            </div>
                            {summary && (
                              <div className="text-xs text-neutral-400 mt-1 line-clamp-3">
                                {summary}
                              </div>
                            )}
                            <div className="flex flex-wrap gap-1 mt-2">
                              {safeTags.slice(0, 3).map(tag => (
                                <span key={tag} className="text-[10px] text-neutral-200 bg-neutral-800 rounded px-2 py-0.5">{tag}</span>
                              ))}
                              {priority && (
                                <span className="text-[10px] text-emerald-200 bg-emerald-900/40 rounded px-2 py-0.5">{priority}</span>
                              )}
                            </div>
                            <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-400">
                              <div className="flex items-center gap-2">
                                <span>#{id}</span>
                                {typeof unread === 'number' && (
                                  <span className="ml-1 text-[11px] text-rose-300 bg-rose-900/40 rounded px-1.5 py-0.5">{unread}</span>
                                )}
                              </div>
                              <div>{since}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
