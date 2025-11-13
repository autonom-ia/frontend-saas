"use client";

import React, { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";
import Image from "next/image";
import Indicators from "./Indicators";
import type { Conversation as MetricsConversation } from "@/services/conversations";

// Simple inputs to avoid new deps; using native date inputs
function toISODate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDateInput(v: string): Date | null {
  if (!v) return null;
  const [y, m, d] = v.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function formatDateBR(v: string): string {
  if (!v) return '';
  const d = parseDateInput(v);
  if (!d) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// Map subdomain used by clients API: "portal" -> "autonomia"
function normalizeDomain(dom?: string): string {
  const d = (dom || '').toLowerCase().trim();
  if (d === 'portal') return 'autonomia';
  return d;
}

// Domain types
type Conversation = {
  status: string | number;
  assignee_id?: number | null;
  assignee_name?: string;
  team_id?: string | number | null;
  team_name?: string | null;
  inbox_name?: string | null;
  inbox_id?: string | number | null;
  last_activity_at?: string;
  lastActivityAt?: string;
  last_activity?: string;
  updated_at?: string;
  created_at?: string;
  createdAt?: string;
  timestamp?: string;
  contact_id?: number;
  contact?: { name?: string; phone_number?: string; phone?: string } | null;
  contact_name?: string;
  name?: string;
  contact_phone?: string;
  phone_number?: string;
  phone?: string;
};

type LoggedUserRow = { id: number; name: string; email?: string; open_conversations: number };

type UserData = {
  isAuthenticated?: boolean;
  IdToken?: string;
  AccessToken?: string;
  token?: string;
  email?: string;
  user?: { id?: string | number; name?: string; photoUrl?: string; isAdmin?: boolean; email?: string };
};

type DomainItem = string;

// Simple count-up hook for quick number animation
function useCountUp(target: number, durationMs: number, deps: ReadonlyArray<unknown> = []) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const to = Math.max(0, Math.floor(target || 0));
    const d = Math.max(120, durationMs);
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / d);
      const eased = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p; // ease in-out
      const current = Math.round(from + (to - from) * eased);
      setValue(current);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return value;
}

export default function MonitoringPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const domainsFetchedRef = React.useRef(false);
  const [range, setRange] = useState<string>("today");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [data, setData] = useState<Conversation[]>([]);
  // UI staged entrance: show header with fade/slide like Settings
  const [showHeader, setShowHeader] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  // Logged users state
  const [loggedUsers, setLoggedUsers] = useState<Array<{id:number; name:string; email:string; open_conversations:number}>>([]);
  const [loggedError, setLoggedError] = useState<string>("");
  const [loggedLoading, setLoggedLoading] = useState(false);
  // Right panel
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<'logged'|'workloads'|'teams'|'stale'|'unassigned'>('logged');
  const [headerReady, setHeaderReady] = useState(false);
  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [domainLoading, setDomainLoading] = useState(false);
  const [domainError, setDomainError] = useState<string>("");
  const [selectedDomain, setSelectedDomain] = useState<string>("");

  // Tabs: mirror Settings style
  const [selectedTab, setSelectedTab] = useState<'atendimentos' | 'indicadores'>(
    'atendimentos'
  );

  // Derived KPIs
  const kpis = useMemo(() => {
    const total = data.length;
    const unassigned = data.filter((r) => r.status === "opened" && (r.assignee_id == null || r.assignee_id === 1)).length;
    const stale = data.filter((r) => {
      if (r.status !== "opened") return false;
      const la = r.last_activity_at ? new Date(r.last_activity_at).getTime() : 0;
      if (!la) return false;
      const now = Date.now();
      return now - la > 24 * 60 * 60 * 1000;
    }).length;
    return { total, unassigned, stale };
  }, [data]);

  // Derived lists for panel
  const staleConversations = useMemo((): Conversation[] => {
    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;
    return (data || []).filter((c: Conversation) => {
      if (c.status !== 'opened' && c.status !== 0) return false;
      const last = c.last_activity_at || c.lastActivityAt || c.last_activity || c.updated_at;
      const lastDate = last ? new Date(last) : null;
      return lastDate ? (now.getTime() - lastDate.getTime() > dayMs) : false;
    });
  }, [data]);

  const unassignedConversations = useMemo((): Conversation[] => {
    return (data || []).filter((c: Conversation) => (c.status === 'opened' || c.status === 0) && (c.assignee_id == null || c.assignee_id === 1));
  }, [data]);

  const formatPhone = (v: unknown) => {
    if (!v) return '—';
    const s = String(v);
    return s;
  };

  const formatDateTime = (v: unknown) => {
    if (!v) return '—';
    try {
      const d = new Date(v as string);
      if (Number.isNaN(d.getTime())) return '—';
      return d.toLocaleString();
    } catch {
      return '—';
    }
  };

  // Diferença em dias em relação a hoje
  const daysFromNow = (v: unknown) => {
    if (!v) return '—';
    try {
      const d = new Date(v as string);
      if (Number.isNaN(d.getTime())) return '—';
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const dayMs = 24 * 60 * 60 * 1000;
      const days = Math.floor(diffMs / dayMs);
      return `${days} ${days === 1 ? 'dia' : 'dias'}`;
    } catch {
      return '—';
    }
  };

  // Animated numbers
  const totalAnimated = useCountUp(kpis.total, 400, [kpis.total]);
  const unassignedAnimated = useCountUp(kpis.unassigned, 400, [kpis.unassigned]);
  const staleAnimated = useCountUp(kpis.stale, 400, [kpis.stale]);

  // Animação dos gráficos (0 -> 1)
  const [chartProgress, setChartProgress] = useState(1);

  const subdomain = useMemo(() => {
    if (typeof window === "undefined") return "empresta";
    const host = window.location.hostname || "";
    const parts = host.split(".");
    if (parts.length < 3) return "empresta";
    return parts[0] || "empresta";
  }, []);

  const effectiveDomain = useMemo(() => {
    if (!userData?.user?.isAdmin) return normalizeDomain(subdomain);
    return selectedDomain || normalizeDomain(subdomain);
  }, [selectedDomain, subdomain, userData?.user?.isAdmin]);

  useEffect(() => {
    if (!userData?.user?.isAdmin) {
      setSelectedDomain("");
      setDomains([]);
      setDomainError("");
      setDomainLoading(false);
      domainsFetchedRef.current = false;
      return;
    }

    // Aguardar até que o user.id esteja disponível
    if (!userData?.user?.id) {
      console.log('[Monitoring] Aguardando user.id carregar...');
      return;
    }

    // Evita re-fetch infinito quando userData muda (ex.: após buscar perfil completo)
    if (domainsFetchedRef.current) return;

    let cancelled = false;

    (async () => {
      try {
        setDomainLoading(true);
        setDomainError("");
        console.log('[Monitoring] Iniciando busca de domínios para user.id:', userData?.user?.id);
        const baseUrl = process.env.NEXT_PUBLIC_CLIENTS_API_URL || "https://api-clients.autonomia.site";
        const token = userData?.IdToken || userData?.token || userData?.AccessToken;
        const uidStr = (() => {
          const u: unknown = userData?.user;
          if (u && typeof u === 'object' && 'id' in (u as Record<string, unknown>)) {
            const v = (u as Record<string, unknown>).id;
            if (typeof v === 'string') return v;
            if (typeof v === 'number') return String(v);
          }
          return '';
        })();
        if (!uidStr) throw new Error('Usuário inválido para carregar clientes');
        const qs = new URLSearchParams({ userId: uidStr });
        const res = await fetch(`${baseUrl}/Autonomia/Clients/Domains?${qs.toString()}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          mode: "cors",
        });
        if (!res.ok) throw new Error(`Erro ao buscar domínios (${res.status})`);
        const json = await res.json();
        const rawItems: unknown[] = Array.isArray(json?.data) ? json.data : [];
        const uniqueDomains: string[] = [];
        for (const item of rawItems) {
          if (typeof item !== "string") continue;
          const normalized = normalizeDomain(item);
          if (uniqueDomains.includes(normalized)) continue;
          uniqueDomains.push(normalized);
        }
        if (cancelled) return;
        console.log('[Monitoring] Domínios carregados:', uniqueDomains);
        setDomains(uniqueDomains);
        if (uniqueDomains.length === 0) {
          setSelectedDomain("");
          domainsFetchedRef.current = true;
          console.log('[Monitoring] Nenhum domínio encontrado');
          return;
        }
        setSelectedDomain((current) => {
          if (current && uniqueDomains.includes(current)) return current;
          return uniqueDomains[0];
        });
        domainsFetchedRef.current = true;
        console.log('[Monitoring] Domínio selecionado:', uniqueDomains[0]);
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "Erro ao carregar domínios";
        setDomainError(msg);
        setDomains([]);
        setSelectedDomain("");
        domainsFetchedRef.current = true;
      } finally {
        if (!cancelled) setDomainLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userData?.user?.isAdmin, userData?.user?.id]);

  // Derive date range based on selection
  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    let start = new Date(end);
    switch (range) {
      case "today":
        start = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 0, 0, 0);
        break;
      case "last3":
        start.setDate(end.getDate() - 2);
        start.setHours(0, 0, 0, 0);
        break;
      case "last7":
        start.setDate(end.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        break;
      case "last30":
        start.setDate(end.getDate() - 29);
        start.setHours(0, 0, 0, 0);
        break;
      case "custom":
        {
          const s = parseDateInput(customStart);
          const e = parseDateInput(customEnd);
          if (s && e) {
            start = new Date(s.getFullYear(), s.getMonth(), s.getDate(), 0, 0, 0);
            end.setFullYear(e.getFullYear(), e.getMonth(), e.getDate());
            end.setHours(23, 59, 59, 999);
          }
        }
        break;
    }
    return { startDate: start, endDate: end };
  }, [range, customStart, customEnd, effectiveDomain]);

  // Fetch logged users only when on Atendimentos tab and when client changes
  useEffect(() => {
    if (selectedTab !== 'atendimentos') return;
    if (profileLoading) return; // Aguardar perfil carregar
    
    const domainParam = effectiveDomain || normalizeDomain(subdomain);
    if (!domainParam) return;
    
    // Para admins: aguardar até que o primeiro domínio seja selecionado
    if (userData?.user?.isAdmin && !selectedDomain) {
      console.log('[LoggedUsers] Aguardando seleção de domínio...');
      return;
    }
    
    (async () => {
      try {
        setLoggedLoading(true);
        setLoggedError("");
        const baseUrl = process.env.NEXT_PUBLIC_CLIENTS_API_URL || "https://api-clients.autonomia.site";
        
        console.log(`[LoggedUsers] Buscando usuários logados para domain: ${domainParam}`);
        
        const params = new URLSearchParams();
        params.set('domain', domainParam);
        
        const url = `${baseUrl}/Autonomia/Clients/LoggedUsers?${params.toString()}`;
        const res = await fetch(url);
        
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Erro ao buscar usuários logados (${res.status}): ${errorText}`);
        }
        
        const json = await res.json();
        const arr = json?.data?.data || json?.data || [];
        const items = Array.isArray(arr) ? arr : [];
        setLoggedUsers(items);
        
        console.log(`[LoggedUsers] Usuários logados encontrados: ${items.length}`);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Erro ao buscar usuários logados';
        console.error('[LoggedUsers] Erro:', msg);
        setLoggedError(msg);
      } finally {
        setLoggedLoading(false);
      }
    })();
  }, [effectiveDomain, selectedTab, profileLoading]);

  // ===== Charts data (blue tones) =====
  const blues = ['#3B82F6', '#60A5FA', '#93C5FD', '#1E40AF', '#2563EB', '#1D4ED8'];
  const statusLabel = (s: string | number) => {
    if (s === 0 || s === 'opened') return 'Abertas';
    if (s === 1 || s === 'resolved' || s === 'closed') return 'Resolvidas';
    if (s === 2 || s === 'pending') return 'Pendentes';
    if (s === 3 || s === 'snoozed') return 'Soneca';
    if (typeof s === 'string') return s.charAt(0).toUpperCase() + s.slice(1);
    return String(s);
  };
  const statusCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of data || []) {
      const st = c.status;
      const key = statusLabel(st);
      map.set(key, (map.get(key) || 0) + 1);
    }
    return Array.from(map.entries()).map(([label, value], idx) => ({ label, value, color: blues[idx % blues.length] }));
  }, [data]);

  const parseDate = (c: Conversation): Date | null => {
    const v = c?.created_at || c?.createdAt || c?.timestamp || c?.last_activity_at || c?.updated_at;
    try {
      const d = v ? new Date(v) : null;
      if (!d || Number.isNaN(d.getTime())) return null;
      return d;
    } catch { return null; }
  };

  const isHoje = useMemo(() => {
    if (!range) return false;
    const r = String(range).toLowerCase();
    return r.includes('hoje') || r === 'today';
  }, [range]);

  const timeSeries = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of data || []) {
      const d = parseDate(c);
      if (!d) continue;
      const key = isHoje
        ? `${d.getHours().toString().padStart(2,'0')}:00`
        : d.toISOString().slice(0,10); // YYYY-MM-DD (stable key)
      map.set(key, (map.get(key) || 0) + 1);
    }
    const entries = Array.from(map.entries()).sort((a,b) => a[0].localeCompare(b[0]));
    if (isHoje) return entries.map(([label, value]) => ({ label, value }));
    return entries.map(([key, value]) => {
      const parts = key.split('-');
      const dd = parts[2] || '';
      const mm = parts[1] || '';
      return { label: `${dd}/${mm}` as string, value };
    });
  }, [data, isHoje]);

  // Inicia animação após termos statusCounts e timeSeries calculados
  useEffect(() => {
    let rafId: number;
    const start = performance.now();
    const duration = 800;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setChartProgress(p);
      if (p < 1) rafId = requestAnimationFrame(tick);
    };
    setChartProgress(0);
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [JSON.stringify(statusCounts), JSON.stringify(timeSeries)]);

  // Pie arc helper
  const describeArc = (cx:number, cy:number, r:number, start:number, end:number) => {
    const startRad = (start - 90) * Math.PI/180;
    const endRad = (end - 90) * Math.PI/180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = end - start <= 180 ? 0 : 1;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  async function fetchConversations() {
    try {
      setLoading(true);
      setError("");
      setData([]);
      const qs = new URLSearchParams({
        accountId: effectiveDomain,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      const baseUrl = process.env.NEXT_PUBLIC_CLIENTS_API_URL || "https://api-clients.autonomia.site";
      const url = `${baseUrl}/conversations?${qs.toString()}`;
      const res = await fetch(url);
      if (!res.ok) {
        const tx = await res.text();
        throw new Error(tx || `Erro ao buscar conversas (${res.status})`);
      }
      const json = await res.json();
      const rows = json?.data || json || [];
      setData(Array.isArray(rows) ? rows : []);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao buscar conversas";
      setError(msg);
    } finally {
      setHeaderReady(true);
      setLoading(false);
    }
  }

  // Trigger fetch on CHANGE of selectors/inputs and effectiveDomain (client)
  useEffect(() => {
    if (profileLoading) return; // Aguardar perfil carregar
    if (range === "custom") {
      if (!customStart || !customEnd) return; // wait for both custom dates
    }
    
    const domainParam = effectiveDomain || normalizeDomain(subdomain);
    if (!domainParam) return;
    
    // Para admins: aguardar até que o primeiro domínio seja selecionado
    if (userData?.user?.isAdmin && !selectedDomain) {
      console.log('[Conversations] Aguardando seleção de domínio...');
      return;
    }
    
    console.log('[Conversations] Buscando conversas para domain:', domainParam);
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, customStart, customEnd, effectiveDomain, profileLoading]);

  useEffect(() => {
    // Load user data from storage
    let mounted = true;
    
    (async () => {
      try {
        const raw = localStorage.getItem('userData');
        if (!raw) {
          console.log('[Monitoring] Nenhum userData no localStorage');
          if (mounted) setProfileLoading(false);
          return;
        }
        
        const parsed = JSON.parse(raw);
        console.log('[Monitoring] userData inicial carregado:', { hasUser: !!parsed.user, hasUserId: !!parsed.user?.id, isAdmin: !!parsed.user?.isAdmin });
        if (mounted) setUserData(parsed);

        // Buscar dados completos do usuário usando o email
        try {
          const tokenComputed: string | undefined = parsed.IdToken || parsed.token || parsed.AccessToken;
          const userEmail = parsed.email || (parsed.user?.email) || '';
          
          if (!userEmail || !tokenComputed) {
            console.log('[Monitoring] Sem email ou token para buscar perfil completo');
            if (mounted) setProfileLoading(false);
            return;
          }
          
          console.log('[Monitoring] Buscando perfil completo para:', userEmail);
          const apiUrl = process.env.NEXT_PUBLIC_PROFILE_API_URL || process.env.NEXT_PUBLIC_API_URL;
          const response = await fetch(
            `${apiUrl}/Autonomia/Profile/Users/email?email=${encodeURIComponent(userEmail)}`,
            {
              headers: { 'Authorization': `Bearer ${tokenComputed}` },
              mode: 'cors'
            }
          );
          
          if (response.ok) {
            const fullUser = await response.json();
            console.log('[Monitoring] Perfil completo recebido:', { hasUser: !!fullUser.user, hasUserId: !!fullUser.user?.id, isAdmin: !!fullUser.user?.isAdmin });
            const updatedData = { ...parsed, user: fullUser.user };
            if (mounted) {
              setUserData(updatedData);
              localStorage.setItem('userData', JSON.stringify(updatedData));
              console.log('[Monitoring] userData atualizado com perfil completo');
            }
          } else {
            console.warn('[Monitoring] Falha ao buscar perfil completo:', response.status);
          }
        } catch (err) {
          console.error('[Monitoring] Erro ao buscar dados completos do usuário:', err);
        } finally {
          if (mounted) setProfileLoading(false);
          console.log('[Monitoring] profileLoading = false');
        }
      } catch (e) { 
        console.error('[Monitoring] erro ao carregar userData', e);
        if (mounted) setProfileLoading(false);
      }
    })();
    
    return () => { mounted = false; };
  }, []);

  // staged header/menu animation (match Settings)
  useEffect(() => {
    const t1 = setTimeout(() => setShowHeader(true), 180);
    const t2 = setTimeout(() => setShowMenu(true), 420);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Ensure custom range has pre-filled dates to avoid native placeholders in header
  useEffect(() => {
    if (range === 'custom') {
      const today = toISODate(new Date());
      if (!customStart) setCustomStart(today);
      if (!customEnd) setCustomEnd(today);
    } else {
      // Hide panel when leaving custom
      setShowCustomPicker(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  // Tela de loading enquanto o perfil é carregado
  if (profileLoading) {
    return (
      <AuthGuard>
        <div className="flex h-screen bg-background dark:bg-gray-900 items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-gray-400 text-sm">Carregando perfil do usuário...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="flex h-screen bg-background dark:bg-gray-900">
        {/* Sidebar */}
        <Sidebar show={showMenu} />

      <div className="flex-1 flex flex-col">
        {/* Header (same visual pattern and animation as Settings) */}
        <header className={`fixed top-0 left-0 right-0 z-[60] flex items-center h-16 bg-gray-800 text-white px-4 transition-all duration-400 ease-out ${showHeader ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}`}>
          {/* Logo */}
          <div className="px-2 flex items-center">
            <Image src="/images/logo.png" alt="Autonom.ia Logo" width={42} height={42} />
          </div>
          {/* Range controls in header */}
          <div className="flex-1 px-2 relative">
            <div
              className={`max-w-xl flex items-center gap-4 transition-all duration-300 ease-out ${headerReady ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
            >
              {userData?.user?.isAdmin && (
                <div className="flex flex-col gap-1 min-w-[220px]">
                  <div className="flex items-center gap-2">
                    <span className="text-sm whitespace-nowrap">Cliente</span>
                    <select
                      className="select-clean min-w-[160px]"
                      value={selectedDomain}
                      onChange={(event) => setSelectedDomain(event.target.value)}
                      disabled={domainLoading || (!domainLoading && domains.length === 0)}
                    >
                      {domainLoading && (
                        <option value="" disabled>
                          Carregando clientes...
                        </option>
                      )}
                      {!domainLoading && domains.length === 0 && (
                        <option value="" disabled>
                          Nenhum cliente disponível
                        </option>
                      )}
                      {!domainLoading && domains.length > 0 && (
                        domains.map((dom) => (
                          <option key={dom} value={dom}>{dom}</option>
                        ))
                      )}
                    </select>
                  </div>
                  {domainError && <span className="text-xs text-red-300">{domainError}</span>}
                </div>
              )}
              {/* Tabs removed from header; rendered in main below */}
              <div className="flex items-center gap-2">
                <span className="text-sm whitespace-nowrap">Informe o período</span>
                <select
                  id="range"
                  className="select-clean"
                  value={range}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'custom') {
                      const today = toISODate(new Date());
                      setCustomStart((prev) => prev || today);
                      setCustomEnd((prev) => prev || today);
                      setShowCustomPicker(true);
                    }
                    setRange(val);
                  }}
                >
                  <option value="today">Hoje</option>
                  <option value="last3">Últimos 3 dias</option>
                  <option value="last7">Últimos 7 dias</option>
                  <option value="last30">Últimos 30 dias</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>
              {range === 'custom' && (
                <div className="relative">
                  {/* Single visible component (no native placeholder) */}
                  <button
                    type="button"
                    className="bg-gray-700 text-white rounded px-3 py-2 hover:bg-gray-600"
                    onClick={() => setShowCustomPicker((v) => !v)}
                    aria-expanded={showCustomPicker}
                    aria-controls="custom-range-panel"
                  >
                    {customStart && customEnd
                      ? `${formatDateBR(customStart)} – ${formatDateBR(customEnd)}`
                      : 'Selecionar período'}
                  </button>

                  {/* Inline panel with the two inputs, pre-filled to avoid placeholder */}
                  {showCustomPicker && (
                    <div
                      id="custom-range-panel"
                      className="absolute top-11 left-0 z-50 bg-gray-800 text-white border border-gray-700 rounded p-3 shadow-xl flex items-center gap-3"
                    >
                      <div className="flex items-center gap-2">
                        <label htmlFor="start" className="text-sm">Início</label>
                        <input
                          id="start"
                          type="date"
                          lang="pt-BR"
                          className="bg-gray-700 text-white rounded px-3 py-2"
                          value={customStart}
                          onChange={(e) => setCustomStart(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label htmlFor="end" className="text-sm">Fim</label>
                        <input
                          id="end"
                          type="date"
                          lang="pt-BR"
                          className="bg-gray-700 text-white rounded px-3 py-2"
                          value={customEnd}
                          onChange={(e) => setCustomEnd(e.target.value)}
                        />
                      </div>
                      <Button
                        className="bg-blue-600 hover:bg-blue-500 text-white"
                        onClick={() => setShowCustomPicker(false)}
                      >
                        Aplicar
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* User info */}
          <div className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm">{userData?.user?.name || 'Usuário'}</span>
            <Avatar>
              {userData?.user?.photoUrl && (
                <AvatarImage src={userData.user.photoUrl} alt={userData?.user?.name || 'Usuário'} />
              )}
              <AvatarFallback>{(userData?.user?.name || '??').split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0,2)}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6 pt-20 ml-20">
          {/* Status */}
          {error && <div className="text-red-400">{error}</div>}

          {/* Tabs - underline style (match Settings) */}
          <div className="mt-1 mb-4">
            <div className="inline-flex items-center gap-6 border-b border-gray-200 dark:border-gray-700">
              <button
                type="button"
                className={`px-2 py-2 text-lg font-semibold ${selectedTab === 'atendimentos' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-200'}`}
                onClick={() => setSelectedTab('atendimentos')}
              >
                Atendimentos
              </button>
              <button
                type="button"
                className={`px-2 py-2 text-lg font-semibold ${selectedTab === 'indicadores' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-200'}`}
                onClick={() => setSelectedTab('indicadores')}
              >
                Indicadores Tempo
              </button>
            </div>
          </div>

          {selectedTab === 'atendimentos' && (
          <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Total de Conversas - sempre azul */}
            <div
              className={`rounded-lg border border-blue-700/60 bg-blue-900/20 p-4 shadow transition-all duration-500 ${showHeader ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
              style={{ transitionDelay: '80ms' }}
            >
              <div className="text-sm text-blue-300">Total de Conversas</div>
              <div className="mt-2 text-4xl font-semibold text-blue-400">{totalAnimated}</div>
            </div>

            {/* Conversas não atribuídas */}
            {(() => {
              const n = kpis.unassigned;
              const color = n === 0 ? 'gray' : n <= 10 ? 'blue' : 'red';
              const palette: Record<string, { border: string; bg: string; text: string; label: string }> = {
                gray: {
                  border: 'border-gray-700/60',
                  bg: 'bg-gray-800/40',
                  text: 'text-gray-300',
                  label: 'text-gray-400',
                },
                blue: {
                  border: 'border-blue-700/60',
                  bg: 'bg-blue-900/20',
                  text: 'text-blue-400',
                  label: 'text-blue-300',
                },
                red: {
                  border: 'border-red-700/60',
                  bg: 'bg-red-900/20',
                  text: 'text-red-400',
                  label: 'text-red-300',
                },
              };
              const p = palette[color];
              return (
                <div
                  onClick={() => { setPanelMode('unassigned'); setPanelOpen(true); }}
                  className={`cursor-pointer rounded-lg p-4 border bg-gray-800/60 ${p.border} ${p.bg} ${p.text} transform transition-all duration-500 hover:scale-[1.01] ${showHeader ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ transitionDelay: '150ms' }}
                >
                  <div className={`text-sm ${p.label}`}>Conversas não atribuídas</div>
                  <div className={`mt-2 text-4xl font-semibold ${p.text}`}>{unassignedAnimated}</div>
                </div>
              );
            })()}

            {/* Conversas sem iteração (>24h) */}
            {(() => {
              const n = kpis.stale;
              const color = n === 0 ? 'gray' : n <= 10 ? 'blue' : 'red';
              const palette: Record<string, { border: string; bg: string; text: string; label: string }> = {
                gray: {
                  border: 'border-gray-700/60',
                  bg: 'bg-gray-800/40',
                  text: 'text-gray-300',
                  label: 'text-gray-400',
                },
                blue: {
                  border: 'border-blue-700/60',
                  bg: 'bg-blue-900/20',
                  text: 'text-blue-400',
                  label: 'text-blue-300',
                },
                red: {
                  border: 'border-red-700/60',
                  bg: 'bg-red-900/20',
                  text: 'text-red-400',
                  label: 'text-red-300',
                },
              };
              const p = palette[color];
              return (
                <div
                  onClick={() => { setPanelMode('stale'); setPanelOpen(true); }}
                  className={`cursor-pointer rounded-lg p-4 border bg-gray-800/60 ${p.border} ${p.bg} ${p.text} transform transition-all duration-500 hover:scale-[1.01] ${showHeader ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ transitionDelay: '240ms' }}
                >
                  <div className={`text-sm ${p.label}`}>Conversas sem iteração (&gt; 24h)</div>
                  <div className={`mt-2 text-4xl font-semibold ${p.text}`}>{staleAnimated}</div>
                </div>
              );
            })()}
          </div>

          {/* Charts: Pie (status) and Bars (atendimentos) */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie chart - Conversas por status */}
            <section>
              <div className="mb-2 text-sm text-gray-300">Total de conversas por status</div>
              <div className="rounded-md border border-gray-700 bg-gray-900/60 p-6">
                {statusCounts.length === 0 ? (
                  <div className="h-56 flex items-center justify-center text-sm text-gray-400">Sem dados para exibir.</div>
                ) : (
                  <div className="h-56 w-full flex flex-col items-center justify-center gap-3">
                    <svg width="220" height="220" viewBox="0 0 220 220" className="mx-auto">
                      {(() => {
                        const total = statusCounts.reduce((s, x) => s + x.value, 0);
                        let angle = 0;
                        const sweep = 360 * chartProgress;
                        const cx = 110, cy = 110, rOuter = 95, rInner = 55;
                        const rLabel = Math.round((rOuter + rInner) / 2);
                        const nodes: ReactNode[] = [];
                        statusCounts.forEach((seg, idx) => {
                          const a = (seg.value / total) * 360;
                          const start = angle;
                          const end = angle + a;
                          const endClamped = Math.min(end, sweep);
                          angle = end; // avança para o próximo segmento
                          if (endClamped > start) {
                            const path = describeArc(cx, cy, rOuter, start, endClamped);
                            nodes.push(<path key={`p-${idx}`} d={path} fill={seg.color} opacity={0.95}/>);
                          }
                        });
                        // Reinicia para posicionar labels
                        angle = 0;
                        statusCounts.forEach((seg, idx) => {
                          const a = (seg.value / total) * 360;
                          const start = angle;
                          const end = angle + a;
                          const mid = start + a / 2;
                          angle = end;
                          // Exibe label somente quando o segmento estiver completamente varrido
                          if (sweep >= end) {
                            const rad = (mid - 90) * Math.PI/180;
                            const x = cx + rLabel * Math.cos(rad);
                            const y = cy + rLabel * Math.sin(rad);
                            nodes.push(
                              <text key={`t-${idx}`} x={x} y={y} fill="#E5E7EB" fontSize="12" textAnchor="middle" dominantBaseline="middle">
                                {seg.value}
                              </text>
                            );
                          }
                        });
                        return nodes;
                      })()}
                      {/* inner circle to make donut */}
                      <circle cx="110" cy="110" r="55" fill="#0B1220"/>
                    </svg>
                    <div className="grid grid-cols-1 gap-1">
                      {statusCounts.map((s, i) => (
                        <div key={i} className="flex items-center justify-center gap-3 text-sm">
                          <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: s.color }} />
                          <span className="text-gray-200">{s.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Bar chart (vertical) - Atendimentos por dia ou hora */}
            <section>
              <div className="mb-2 text-sm text-gray-300">{isHoje ? 'Atendimentos por hora (Hoje)' : 'Atendimentos por dia'}</div>
              <div className="rounded-md border border-gray-700 bg-gray-900/60 p-6">
                {timeSeries.length === 0 ? (
                  <div className="h-56 flex items-center justify-center text-sm text-gray-400">Sem dados para exibir.</div>
                ) : (
                  <div className="h-56 w-full overflow-x-auto">
                    <div
                      className="h-56 flex items-end gap-3 pr-2"
                      style={{ minWidth: timeSeries.length * 56 }}
                    >
                      {(() => {
                        const max = Math.max(...timeSeries.map(t => t.value));
                        return timeSeries.map((t, idx) => {
                          const hRaw = max > 0 ? (t.value / max) * 100 : 0;
                          const hAnim = hRaw * chartProgress;
                          const h = Math.max(Math.round(hAnim), t.value > 0 ? 3 : 0); // min 3% se valor > 0
                          return (
                            <div key={idx} className="flex-1 flex flex-col items-center" style={{ minWidth: 56 }}>
                              <div className="w-full h-44 relative">
                                <div
                                  className="absolute left-1/2 -translate-x-1/2 text-[10px] text-gray-200"
                                  style={{ bottom: `calc(${h}% + 4px)` }}
                                >
                                  {t.value}
                                </div>
                                <div className="absolute bottom-0 w-full bg-blue-500 rounded-sm" style={{ height: `${h}%` }} />
                              </div>
                              <div className="mt-1 text-[10px] text-gray-300 truncate w-full text-center" title={t.label}>{t.label}</div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Three side-by-side grids (tables) */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Logged users (top 5 as table) */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm text-gray-300">Usuários logados</h2>
                {loggedError && <span className="text-xs text-red-400">{loggedError}</span>}
              </div>
              <div className="flex flex-col h-72 overflow-hidden border border-gray-700 rounded-md">
                <div className="flex-1 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-800 text-gray-300">
                    <tr>
                      <th className="text-left px-3 py-2">Usuário</th>
                      <th className="text-right px-3 py-2">Conversas abertas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const list = (loggedUsers || []).slice().sort((a,b)=> (b.open_conversations||0) - (a.open_conversations||0));
                      const top5: LoggedUserRow[] = list.slice(0,5);
                      if (loggedLoading) {
                        return Array.from({ length: 5 }).map((_, idx) => (
                          <tr key={idx} className="odd:bg-gray-900 even:bg-gray-800 text-gray-100">
                            <td className="px-3 py-2" colSpan={2}><div className="h-4 animate-pulse bg-gray-700 rounded" /></td>
                          </tr>
                        ));
                      }
                      return top5.length > 0 ? top5.map((u, idx) => (
                        <tr key={idx} className="odd:bg-gray-900 even:bg-gray-800 text-gray-100">
                          <td className="px-3 py-2 truncate">{u.name || '—'}</td>
                          <td className="px-3 py-2 text-right">{u.open_conversations ?? 0}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td className="px-3 py-3 text-gray-400" colSpan={2}>Nenhum usuário logado.</td>
                        </tr>
                      );
                    })()}
                  </tbody>
                </table>
                </div>
                <div className="px-3 py-2 text-right bg-gray-800 border-t border-gray-700">
                  <button
                    className="text-xs text-blue-400 hover:text-blue-300 underline"
                    onClick={() => { setPanelMode('logged'); setPanelOpen(true); }}
                  >
                    Ver todos
                  </button>
                </div>
              </div>
            </section>

            {/* Workloads by user from conversations (period) as table */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm text-gray-300">Atendimentos por usuário (período)</h2>
              </div>
              <div className="flex flex-col h-72 overflow-hidden border border-gray-700 rounded-md">
                <div className="flex-1 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-800 text-gray-300">
                    <tr>
                      <th className="text-left px-3 py-2">Usuário</th>
                      <th className="text-right px-3 py-2">Quantidade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const map = new Map<number, { id:number; name:string; count:number }>();
                      for (const r of data) {
                        if (r.assignee_id == null) continue;
                        const id = Number(r.assignee_id);
                        const name = r.assignee_name || `Usuário ${id}`;
                        const curr = map.get(id) || { id, name, count: 0 };
                        curr.count += 1;
                        map.set(id, curr);
                      }
                      const list = Array.from(map.values()).sort((a,b)=> b.count - a.count);
                      const top5 = list.slice(0,5);
                      return top5.length > 0 ? top5.map((u) => (
                        <tr key={u.id} className="odd:bg-gray-900 even:bg-gray-800 text-gray-100">
                          <td className="px-3 py-2 truncate">{u.name}</td>
                          <td className="px-3 py-2 text-right">{u.count}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td className="px-3 py-3 text-gray-400" colSpan={2}>Sem atendimentos no período.</td>
                        </tr>
                      );
                    })()}
                  </tbody>
                </table>
                </div>
                <div className="px-3 py-2 text-right bg-gray-800 border-t border-gray-700">
                  <button
                    className="text-xs text-blue-400 hover:text-blue-300 underline"
                    onClick={() => { setPanelMode('workloads'); setPanelOpen(true); }}
                  >
                    Ver todos
                  </button>
                </div>
              </div>
            </section>

            {/* Workloads by team from conversations (period) as table */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm text-gray-300">Atendimentos por time (período)</h2>
              </div>
              <div className="flex flex-col h-72 overflow-hidden border border-gray-700 rounded-md">
                <div className="flex-1 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-800 text-gray-300">
                    <tr>
                      <th className="text-left px-3 py-2">Time</th>
                      <th className="text-right px-3 py-2">Quantidade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const map = new Map<string, { id: string; name: string; count: number }>();
                      for (const r of data) {
                        const id = String(r.team_id ?? '');
                        const name = (r.team_name ?? '').toString().trim() || (id ? `Time ${id}` : 'Sem time');
                        if (!id && !name) continue;
                        const key = name || id;
                        const curr = map.get(key) || { id: id || key, name: key, count: 0 };
                        curr.count += 1;
                        map.set(key, curr);
                      }
                      const list = Array.from(map.values()).sort((a,b)=> b.count - a.count);
                      const top5 = list.slice(0,5);
                      return top5.length > 0 ? top5.map((t) => (
                        <tr key={t.id + t.name} className="odd:bg-gray-900 even:bg-gray-800 text-gray-100">
                          <td className="px-3 py-2 truncate">{t.name}</td>
                          <td className="px-3 py-2 text-right">{t.count}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td className="px-3 py-3 text-gray-400" colSpan={2}>Sem atendimentos no período.</td>
                        </tr>
                      );
                    })()}
                  </tbody>
                </table>
                </div>
                <div className="px-3 py-2 text-right bg-gray-800 border-t border-gray-700">
                  <button
                    className="text-xs text-blue-400 hover:text-blue-300 underline"
                    onClick={() => { setPanelMode('teams'); setPanelOpen(true); }}
                  >
                    Ver todos
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Slide-over right panel */}
          <div className={`fixed top-16 right-0 bottom-0 w-full sm:w-[28rem] bg-gray-900/95 backdrop-blur border-l border-gray-700 z-[70] transform transition-transform duration-300 ${panelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <div className="text-white text-sm font-medium">
                  {panelMode === 'logged' && 'Todos os usuários logados'}
                  {panelMode === 'workloads' && 'Atendimentos por usuário (completo)'}
                  {panelMode === 'teams' && 'Atendimentos por time (completo)'}
                  {panelMode === 'stale' && 'Conversas sem iteração (> 24h)'}
                  {panelMode === 'unassigned' && 'Conversas não atribuídas'}
                </div>
                <button className="text-gray-300 hover:text-white" onClick={()=> setPanelOpen(false)}>Fechar</button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                {panelMode === 'logged' ? (
                  <div className="grid grid-cols-1 gap-3">
                    {loggedUsers.slice().sort((a,b)=> (b.open_conversations||0) - (a.open_conversations||0)).map((u) => {
                      const inboxes = Array.from(new Set(
                        (data || [])
                          .filter((r) => r.assignee_id != null && Number(r.assignee_id) === Number(u.id))
                          .map((r) => (r.inbox_name || '').toString().trim())
                          .filter(Boolean)
                      )).sort((a, b) => a.localeCompare(b));
                      return (
                        <div key={u.id} className="rounded-md border border-gray-700 bg-gray-800/60 p-3">
                          <div className="text-sm text-white font-medium">{u.name || '—'}</div>
                          <div className="text-xs text-gray-400">{u.email || '—'}</div>
                          <div className="mt-2 text-xs text-blue-300">Abertas: {u.open_conversations ?? 0}</div>
                          <div className="mt-2 text-xs text-gray-300">
                            <span className="text-gray-400">Caixas de entrada:</span>
                            {inboxes.length > 0 ? (
                              <div className="mt-1 flex flex-wrap gap-2">
                                {inboxes.map((name) => (
                                  <span key={name} className="inline-block bg-gray-700 text-gray-100 px-2 py-0.5 rounded text-[11px]">{name}</span>
                                ))}
                              </div>
                            ) : (
                              <span className="ml-1 text-gray-500">—</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {(!loggedUsers || loggedUsers.length === 0) && (
                      <div className="text-sm text-gray-400">Nenhum usuário logado.</div>
                    )}
                  </div>
                ) : panelMode === 'workloads' ? (
                  (() => {
                    const map = new Map<number, { id:number; name:string; count:number }>();
                    for (const r of data) {
                      if (r.assignee_id == null) continue;
                      const id = Number(r.assignee_id);
                      const name = r.assignee_name || `Usuário ${id}`;
                      const curr = map.get(id) || { id, name, count: 0 };
                      curr.count += 1;
                      map.set(id, curr);
                    }
                    const list = Array.from(map.values()).sort((a,b)=> b.count - a.count);
                    return (
                      <div className="grid grid-cols-1 gap-3">
                        {list.map((u) => (
                          <div key={u.id} className="rounded-md border border-gray-700 bg-gray-800/60 p-3">
                            <div className="text-sm text-white font-medium">{u.name}</div>
                            <div className="mt-1 text-xs text-gray-400">ID: {u.id}</div>
                            <div className="mt-2 text-2xl text-blue-400 font-semibold">{u.count}</div>
                          </div>
                        ))}
                        {list.length === 0 && (
                          <div className="text-sm text-gray-400">Selecione uma opção.</div>
                        )}
                      </div>
                    );
                  })()
                ) : panelMode === 'stale' ? (
                  <div className="overflow-hidden border border-gray-700 rounded-md">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-800 text-gray-300">
                        <tr>
                          <th className="text-left px-3 py-2">Contato</th>
                          <th className="text-left px-3 py-2">Telefone</th>
                          <th className="text-left px-3 py-2 whitespace-nowrap min-w-[110px]">Sem Contato</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staleConversations.map((c: Conversation, idx:number) => {
                          const name = c.contact_name || c.name || c.contact?.name || `Contato ${c.contact_id || ''}`;
                          const phone = c.contact_phone || c.phone_number || c.contact?.phone_number || c.contact?.phone || c.phone;
                          const last = c.last_activity_at || c.lastActivityAt || c.last_activity || c.updated_at;
                          return (
                            <tr key={idx} className="odd:bg-gray-900 even:bg-gray-800 text-gray-100">
                              <td className="px-3 py-2 truncate max-w-[160px]" title={name || '—'}>{name || '—'}</td>
                              <td className="px-3 py-2 truncate">{formatPhone(phone)}</td>
                              <td className="px-3 py-2 whitespace-nowrap min-w-[110px]">{daysFromNow(last)}</td>
                            </tr>
                          );
                        })}
                        {staleConversations.length === 0 && (
                          <tr><td className="px-3 py-3 text-gray-400" colSpan={3}>Nenhuma conversa encontrada.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="overflow-hidden border border-gray-700 rounded-md">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-800 text-gray-300">
                        <tr>
                          <th className="text-left px-3 py-2">Contato</th>
                          <th className="text-left px-3 py-2">Telefone</th>
                          <th className="text-left px-3 py-2 whitespace-nowrap min-w-[110px]">Último Contato</th>
                        </tr>
                      </thead>
                      <tbody>
                        {unassignedConversations.map((c: Conversation, idx:number) => {
                          const name = c.contact_name || c.name || c.contact?.name || `Contato ${c.contact_id || ''}`;
                          const phone = c.contact_phone || c.phone_number || c.contact?.phone_number || c.contact?.phone || c.phone;
                          const last = c.last_activity_at || c.lastActivityAt || c.last_activity || c.updated_at;
                          return (
                            <tr key={idx} className="odd:bg-gray-900 even:bg-gray-800 text-gray-100">
                              <td className="px-3 py-2 truncate max-w-[160px]" title={name}>{name}</td>
                              <td className="px-3 py-2 truncate">{formatPhone(phone)}</td>
                              <td className="px-3 py-2 whitespace-nowrap min-w-[110px]">{daysFromNow(last)}</td>
                            </tr>
                          );
                        })}
                        {unassignedConversations.length === 0 && (
                          <tr><td className="px-3 py-3 text-gray-400" colSpan={3}>Nenhuma conversa encontrada.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
                  </>
          )}
          {selectedTab === 'indicadores' && (
            <Indicators data={data as unknown as MetricsConversation[]} />
          )}
        </main>
      </div>
    </div>
    </AuthGuard>
  );
}
