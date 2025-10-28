"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ItemDetailsPanel from "./components/ItemDetailsPanel";
import Image from "next/image";
import Sidebar from "../../components/Sidebar";
import ProductHeader from "../../components/ProductHeader";
import { MessageCircle } from "lucide-react";
import SelectedAccountBar from "../../components/SelectedAccountBar";
import {
  SESSION_SELECTED_PRODUCT_ID_KEY,
  SESSION_SELECTED_ACCOUNT_KEY,
  SESSION_SELECTED_ACCOUNT_BUNDLE_KEY,
} from "../../utils/sessionKeys";

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
    if (typeof window === "undefined") return;
    try {
      const storedProduct = sessionStorage.getItem(SESSION_SELECTED_PRODUCT_ID_KEY);
      if (storedProduct) setSelectedProductId(storedProduct);
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
    if (!selectedProductId) return;
    if (typeof window === "undefined") return;
    try {
      const rawBundle = sessionStorage.getItem(SESSION_SELECTED_ACCOUNT_BUNDLE_KEY);
      if (rawBundle) {
        try {
          const parsed = JSON.parse(rawBundle) as { productId?: string; accountId?: string } | null;
          if (parsed?.productId === selectedProductId && parsed.accountId) {
            setSelectedAccountId(parsed.accountId);
            return;
          }
        } catch {}
      }
      const rawAccount = sessionStorage.getItem(SESSION_SELECTED_ACCOUNT_KEY);
      if (rawAccount) {
        setSelectedAccountId(rawAccount);
      }
    } catch {}
  }, [selectedProductId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (selectedAccountId) {
        sessionStorage.setItem(SESSION_SELECTED_ACCOUNT_KEY, selectedAccountId);
        if (selectedProductId) {
          sessionStorage.setItem(SESSION_SELECTED_ACCOUNT_BUNDLE_KEY, JSON.stringify({ productId: selectedProductId, accountId: selectedAccountId }));
        }
        return;
      }
      sessionStorage.removeItem(SESSION_SELECTED_ACCOUNT_KEY);
      sessionStorage.removeItem(SESSION_SELECTED_ACCOUNT_BUNDLE_KEY);
    } catch {}
  }, [selectedAccountId, selectedProductId]);
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

  useEffect(() => {
    if (accountsLoading) return;
    if (!selectedAccountId) return;
    if (accounts.some(acc => acc.id === selectedAccountId)) return;
    setSelectedAccountId("");
  }, [accounts, accountsLoading, selectedAccountId]);

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
  const [kanbanItemsByStep, setKanbanItemsByStep] = useState<Record<string, KanbanItem[]>>({});
  const [funnelId, setFunnelId] = useState<string>("");
  const [funnelName, setFunnelName] = useState<string>("");
  type Step = { id: string; name: string; shipping_order?: number };
  const [steps, setSteps] = useState<Step[]>([]);
  const [stepsLoading, setStepsLoading] = useState(false);
  const lanesRef = useRef<HTMLDivElement | null>(null);
  const [selectedItem, setSelectedItem] = useState<KanbanItem | null>(null);
  // Pagination per step: offset and hasMore
  const [stepOffsets, setStepOffsets] = useState<Record<string, number>>({});
  const [stepHasMore, setStepHasMore] = useState<Record<string, boolean>>({});
  const [loadingMoreForStep, setLoadingMoreForStep] = useState<string | null>(null);
  const [loadingSteps, setLoadingSteps] = useState<Record<string, boolean>>({});
  const [draggedItem, setDraggedItem] = useState<{ item: KanbanItem; fromStepId: string } | null>(null);
  const [dragOverStepId, setDragOverStepId] = useState<string | null>(null);
  const [chatwootUrl, setChatwootUrl] = useState<string>("");

  // Load items for a specific step
  const loadItemsForStep = async (stepId: string, offset: number = 0): Promise<KanbanItem[]> => {
    if (!selectedAccountId) return [];
    
    try {
      const url = `${saasApiUrl}/Autonomia/Saas/KanbanItems?accountId=${encodeURIComponent(selectedAccountId)}&funnelStageId=${encodeURIComponent(stepId)}&limit=100&offset=${offset}`;
      const resp = await fetch(url, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
        mode: "cors",
      });
      
      if (!resp.ok) {
        console.error(`Falha ao carregar itens da etapa ${stepId}:`, resp.status, resp.statusText);
        return [];
      }
      
      const j = await resp.json();
      // API can return {data: [...]} or [...] directly
      const data = Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : [];
      
      // Get funnel info from first item
      if (data.length > 0 && !funnelId) {
        const first = data[0] as KanbanItem;
        setFunnelId(String(first?.funnel_id || ""));
        setFunnelName(String(first?.funnel_name || ""));
      }
      
      return data as KanbanItem[];
    } catch (e) {
      console.error(`Erro ao carregar itens da etapa ${stepId}:`, e);
      return [];
    }
  };

  // Load initial items for all steps
  useEffect(() => {
    (async () => {
      if (!selectedAccountId) {
        setKanbanItemsByStep({});
        setStepOffsets({});
        setStepHasMore({});
        setLoadingSteps({});
        return;
      }
      
      if (steps.length === 0) {
        return;
      }
      
      try {
        setKanbanLoading(true);
        setKanbanError("");
        
        // Mark all steps as loading
        const loadingState: Record<string, boolean> = {};
        steps.forEach(step => { loadingState[step.id] = true; });
        setLoadingSteps(loadingState);
        
        const itemsByStep: Record<string, KanbanItem[]> = {};
        const offsets: Record<string, number> = {};
        const hasMore: Record<string, boolean> = {};
        
        // Load first 100 items for each step in parallel
        await Promise.all(
          steps.map(async (step) => {
            const items = await loadItemsForStep(step.id, 0);
            itemsByStep[step.id] = items;
            offsets[step.id] = 100;
            hasMore[step.id] = items.length >= 100;
            // Mark this step as loaded
            setLoadingSteps(prev => ({ ...prev, [step.id]: false }));
          })
        );
        
        setKanbanItemsByStep(itemsByStep);
        setStepOffsets(offsets);
        setStepHasMore(hasMore);
      } catch (e: unknown) {
        const msg = e && typeof e === 'object' && 'message' in e ? String((e as { message?: unknown }).message) : 'Erro ao carregar Kanban';
        setKanbanError(msg);
      } finally {
        setKanbanLoading(false);
        setLoadingSteps({});
      }
    })();
  }, [selectedAccountId, steps, authToken, saasApiUrl]);

  // Load account parameters to get chatwoot-url
  useEffect(() => {
    (async () => {
      if (!selectedAccountId) {
        setChatwootUrl("");
        return;
      }

      try {
        const url = `${saasApiUrl}/Autonomia/Saas/AccountParameters?accountId=${encodeURIComponent(selectedAccountId)}`;
        const resp = await fetch(url, {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
          mode: 'cors',
        });

        if (resp.ok) {
          const j = await resp.json();
          const data = Array.isArray(j?.data) ? j.data : [];
          const chatwootParam = data.find((p: any) => p.name === 'chatwoot-url');
          if (chatwootParam?.value) {
            setChatwootUrl(chatwootParam.value);
          }
        }
      } catch (err) {
        console.error('[Kanban] Error loading account parameters:', err);
      }
    })();
  }, [selectedAccountId, saasApiUrl, authToken]);

  // Load steps when funnelId is known (fallback to accountId if needed)
  useEffect(() => {
    (async () => {
      if (!selectedAccountId) { 
        setSteps([]); 
        return; 
      }
      
      try {
        setStepsLoading(true);
        const url = `${saasApiUrl}/Autonomia/Saas/ConversationFunnelSteps?accountId=${encodeURIComponent(selectedAccountId)}${funnelId ? `&funnelId=${encodeURIComponent(funnelId)}` : ''}`;
        
        const resp = await fetch(url, {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
          mode: 'cors',
        });
        
        if (resp.ok) {
          const j = await resp.json();
          const data = Array.isArray(j?.data) ? j.data : [];
          
          // normalize (no-any)
          const norm: Step[] = data.map((s: unknown) => {
            const obj = (s ?? {}) as Record<string, unknown>;
            const id = String(obj.id ?? "");
            const name = String(obj.name ?? "");
            const shipping_order = typeof obj.shipping_order === 'number' ? obj.shipping_order : undefined;
            return { id, name, shipping_order };
          });
          
          setSteps(norm);
        } else {
          setSteps([]);
        }
      } catch (err) {
        setSteps([]);
      } finally {
        setStepsLoading(false);
      }
    })();
  }, [selectedAccountId, funnelId, saasApiUrl, authToken]);

  // Group items by step using steps list
  type Column = { key: string; title: string; items: KanbanItem[] };
  const columns: Column[] = useMemo(() => {
    const cols: Column[] = steps.map((s) => ({ 
      key: s.id, 
      title: s.name, 
      items: kanbanItemsByStep[s.id] || [] 
    }));
    return cols;
  }, [kanbanItemsByStep, steps]);

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

  // Format summary with markdown-like bold sections
  const formatSummary = (text: string) => {
    if (!text) return null;
    
    // Split by ** markers, capturing the content between them
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    
    return parts.map((part, idx) => {
      // Odd indices are the content that was between **
      if (idx % 2 === 1) {
        return (
          <span key={idx}>
            <br />
            <strong className="font-semibold text-neutral-200">{part}</strong>
          </span>
        );
      }
      // Even indices are regular text (without **)
      return <span key={idx}>{part}</span>;
    });
  };

  // Update kanban item stage
  const updateItemStage = async (itemId: string, newStageId: string) => {
    if (!authToken) {
      console.error('[Kanban] No auth token available');
      return false;
    }

    try {
      const url = `${saasApiUrl}/Autonomia/Saas/KanbanItems/${encodeURIComponent(itemId)}`;
      const resp = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        mode: 'cors',
        body: JSON.stringify({
          funnel_stage_id: newStageId,
        }),
      });

      if (!resp.ok) {
        console.error('[Kanban] Failed to update item stage:', resp.status, resp.statusText);
        return false;
      }

      console.log('[Kanban] Item stage updated successfully');
      return true;
    } catch (e) {
      console.error('[Kanban] Error updating item stage:', e);
      return false;
    }
  };

  // Drag and drop handlers
  const handleDragStart = (item: KanbanItem, fromStepId: string) => {
    setDraggedItem({ item, fromStepId });
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverStepId(null);
  };

  const handleDragOver = (e: React.DragEvent, stepId: string) => {
    e.preventDefault();
    setDragOverStepId(stepId);
  };

  const handleDragLeave = () => {
    setDragOverStepId(null);
  };

  const handleDrop = async (e: React.DragEvent, toStepId: string) => {
    e.preventDefault();
    setDragOverStepId(null);

    if (!draggedItem) return;

    const { item, fromStepId } = draggedItem;
    const itemId = String(item.id);

    // If dropped in the same column, do nothing
    if (fromStepId === toStepId) {
      setDraggedItem(null);
      return;
    }

    console.log(`[Kanban] Moving item ${itemId} from ${fromStepId} to ${toStepId}`);

    // Optimistic update
    setKanbanItemsByStep(prev => {
      const newState = { ...prev };
      // Remove from old column
      newState[fromStepId] = (prev[fromStepId] || []).filter(it => String(it.id) !== itemId);
      // Add to new column with updated stage
      const updatedItem = { ...item, funnel_stage_id: toStepId };
      newState[toStepId] = [...(prev[toStepId] || []), updatedItem];
      return newState;
    });

    // Update via API
    const success = await updateItemStage(itemId, toStepId);

    if (!success) {
      // Rollback on failure
      setKanbanItemsByStep(prev => {
        const newState = { ...prev };
        newState[toStepId] = (prev[toStepId] || []).filter(it => String(it.id) !== itemId);
        newState[fromStepId] = [...(prev[fromStepId] || []), item];
        return newState;
      });
    }

    setDraggedItem(null);
  };

  // Open Chatwoot conversation
  const openChatwoot = (item: KanbanItem) => {
    const inboxId = item.user_session_inbox_id;
    const conversationId = item.user_session_conversation_id;

    if (!inboxId || !conversationId) {
      console.warn('[Kanban] Missing inbox_id or conversation_id for item', item.id);
      return;
    }

    if (!chatwootUrl) {
      console.warn('[Kanban] Chatwoot URL not configured');
      return;
    }

    const url = `${chatwootUrl}/app/accounts/${inboxId}/conversations/${conversationId}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Load more items for a specific step
  const loadMoreForStep = async (stepId: string) => {
    if (!selectedAccountId || loadingMoreForStep) return;
    const currentOffset = stepOffsets[stepId] || 100;
    
    try {
      setLoadingMoreForStep(stepId);
      const newItems = await loadItemsForStep(stepId, currentOffset);
      
      if (newItems.length > 0) {
        setKanbanItemsByStep(prev => ({
          ...prev,
          [stepId]: [...(prev[stepId] || []), ...newItems]
        }));
        setStepOffsets(prev => ({ ...prev, [stepId]: currentOffset + 100 }));
        setStepHasMore(prev => ({ ...prev, [stepId]: newItems.length >= 100 }));
      } else {
        setStepHasMore(prev => ({ ...prev, [stepId]: false }));
      }
    } catch (e) {
      console.error('Erro ao carregar mais itens:', e);
      setStepHasMore(prev => ({ ...prev, [stepId]: false }));
    } finally {
      setLoadingMoreForStep(null);
    }
  };

  // Derive initials for header avatar (same pattern as other pages)
  const userInitials = userData?.user?.name
    ? userData.user.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
    : "??";

  return (
    <div className="flex h-screen bg-background dark:bg-gray-900 overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar show={showMenu} />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full">
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
        <main className="flex-1 flex flex-col min-h-0 min-w-0 p-6 pt-16 ml-20 overflow-hidden">
          {/* Selected Account bar */}
          {selectedProductId && selectedAccountId && (
            <div className="sticky top-5 z-50 w-full max-w-full min-w-0 overflow-hidden">
              <SelectedAccountBar
                name={accounts.find(a => a.id === selectedAccountId)?.name || 'Conta'}
                isAdmin={false}
                onChangeAccount={() => setSelectedAccountId("")}
              />
            </div>
          )}

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
            <section className="mt-4 flex-1 min-h-0 min-w-0 overflow-hidden">
              {/* Funnel title */}
              {funnelName && (
                <div className="relative top-5 mb-3 text-2xl font-semibold text-white dark:text-white">{funnelName}</div>
              )}

              {!kanbanLoading && kanbanError && (
                <div className="mb-3 text-sm text-neutral-400">{kanbanError}</div>
              )}

              {/* Empty state */}
              {!kanbanLoading && !stepsLoading && columns.length === 0 && (
                <div className="mt-2 text-sm text-neutral-400">Nenhum item encontrado para esta conta.</div>
              )}

              <div className="flex-1 min-h-0 min-w-0 relative">
                <div
                  ref={lanesRef}
                  onWheel={(e) => {
                    const el = lanesRef.current;
                    if (!el) return;
                    if (Math.abs(e.deltaX) < 2 && Math.abs(e.deltaY) > 0) {
                      el.scrollLeft += e.deltaY;
                      e.preventDefault();
                    }
                  }}
                  className="relative top-5 h-full w-full max-w-full overflow-x-auto overflow-y-hidden whitespace-nowrap pr-8 pb-2 overscroll-x-contain"
                  role="region"
                  aria-label="Kanban lanes"
                >
                  <div className="min-w-max inline-flex gap-4">
                    {columns.map((col) => (
                      <div 
                        key={col.key} 
                        className={`w-80 shrink-0 rounded-lg border transition-all duration-500 ${
                          dragOverStepId === col.key 
                            ? 'border-blue-500 bg-blue-900/20' 
                            : 'border-neutral-800/60 bg-neutral-900/40'
                        } ${loadingSteps[col.key] ? 'opacity-50 animate-pulse' : 'opacity-100'}`}
                        onDragOver={(e) => handleDragOver(e, col.key)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, col.key)}
                      >
                        <div className="px-4 py-3 border-b border-neutral-800/60 flex items-center justify-between">
                          <div className="text-sm font-medium lowercase tracking-wide text-neutral-100">{col.title}</div>
                          <div className="text-xs text-neutral-400">
                            {loadingSteps[col.key] ? (
                              <span className="inline-block animate-spin">⟳</span>
                            ) : (
                              col.items.length
                            )}
                          </div>
                        </div>
                        <div className="p-3 space-y-3 max-h-[60vh] overflow-y-auto min-h-[100px]">
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
                                .map((t) => (typeof t === 'string' ? { name: t } : t))
                                .filter((t) => !!t && !!t.name)
                                .slice(0, 4);
                              return (
                                <div
                                  key={id}
                                  draggable={true}
                                  onDragStart={() => handleDragStart(it, col.key)}
                                  onDragEnd={handleDragEnd}
                                  className={`rounded-md border border-neutral-800/60 bg-neutral-900/60 p-3 cursor-move hover:bg-neutral-900/80 transition-all ${
                                    draggedItem?.item.id === it.id ? 'opacity-50 scale-95' : 'opacity-100'
                                  }`}
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => setSelectedItem(it)}
                                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedItem(it); } }}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="text-sm font-semibold text-white truncate flex-1" title={title}>{title}</div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      {!!it.user_session_inbox_id && !!it.user_session_conversation_id && !!chatwootUrl && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openChatwoot(it);
                                          }}
                                          className="p-1 hover:bg-neutral-700/50 rounded transition-colors"
                                          title="Abrir conversa no Chatwoot"
                                        >
                                          <MessageCircle className="w-4 h-4 text-blue-400" />
                                        </button>
                                      )}
                                      <span className="text-[11px] text-neutral-300 bg-neutral-800 rounded px-2 py-0.5">{status}</span>
                                    </div>
                                  </div>
                                  <div className="text-xs text-neutral-400 mt-1 line-clamp-6">{formatSummary(summary)}</div>
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {safeTags.map((t, idx) => (
                                      <span key={idx} className="text-[11px] text-blue-300 bg-blue-900/30 border border-blue-900/40 rounded px-1.5 py-0.5">{t.name}</span>
                                    ))}
                                  </div>
                                  <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-400">
                                    <div className="flex items-center gap-2">
                                      <span>Último Contato</span>
                                      {typeof unread === 'number' && (
                                        <span className="ml-1 text-[11px] text-rose-300 bg-rose-900/40 rounded px-1.5 py-0.5">{unread}</span>
                                      )}
                                    </div>
                                    <div>{since}</div>
                                  </div>
                                </div>
                              );
                          })}
                          {/* Load more button */}
                          {stepHasMore[col.key] && (
                            <button
                              onClick={() => loadMoreForStep(col.key)}
                              disabled={loadingMoreForStep === col.key}
                              className="w-full py-2 px-3 text-xs text-neutral-300 bg-neutral-800/40 hover:bg-neutral-800/60 border border-neutral-700/50 rounded-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {loadingMoreForStep === col.key ? (
                                <span className="flex items-center justify-center gap-2">
                                  <span className="inline-block animate-spin">⟳</span>
                                  Carregando...
                                </span>
                              ) : (
                                'Carregar mais'
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Item details panel */}
          {selectedItem && (
            <ItemDetailsPanel item={selectedItem} onClose={() => setSelectedItem(null)} />
          )}
        </main>
      </div>
    </div>
  );
}
