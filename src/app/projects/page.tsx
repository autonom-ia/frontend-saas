"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";
import Sidebar from "../../components/Sidebar";

// Types
type UserData = {
  user?: { id?: string; name?: string; email?: string; isAdmin?: boolean };
  token?: string;
  IdToken?: string;
  AccessToken?: string;
  isAuthenticated?: boolean;
};

type Project = {
  id: string;
  name: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  product_id: string;
  created_at?: string;
  updated_at?: string;
};

type Product = {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
};

type TimelineItem = {
  code: string;
  project_id: string;
  phase?: string | null;
  task?: string | null;
  responsible?: string | null;
  supporters?: string | null;
  start_date?: string | null;
  due_date?: string | null;
  execution_start_date?: string | null;
  execution_end_date?: string | null;
  status?: string | null;
  dependencies?: string | null;
  acceptance_criteria?: string | null;
  evidence_link?: string | null;
  milestone?: boolean | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  id?: string;
  project_name?: string;
  product_id?: string;
};

// Internal type used for rendering the Gantt (parsed dates)
type ParsedTimelineItem = TimelineItem & {
  _start: Date | null;
  _due: Date | null;
  _execStart: Date | null;
  _execEnd: Date | null;
};

export default function ProjectsPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [authToken, setAuthToken] = useState<string | undefined>(undefined);

  // API URLs
  const projectApiUrl = useMemo(() => process.env.NEXT_PUBLIC_PROJECT_API_URL || "https://api-projects.autonomia.site", []);

  // UI staged entrance
  const [showHeader, setShowHeader] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setShowHeader(true), 160);
    const t2 = setTimeout(() => setShowContent(true), 340);
    const t3 = setTimeout(() => setShowMenu(true), 420);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | "">("");

  // Products for form select (same source as Settings)
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState<boolean>(false);

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formProductId, setFormProductId] = useState("");
  const [saving, setSaving] = useState(false);

  // Timeline
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [selectedTimeline, setSelectedTimeline] = useState<TimelineItem | null>(null);
  const [isTimelinePanelOpen, setIsTimelinePanelOpen] = useState(false);

  const tokenFrom = (data: UserData | null): string | undefined => {
    if (!data) return undefined;
    return data.IdToken || data.token || data.AccessToken;
  };

  // Auth load
  useEffect(() => {
    const stored = localStorage.getItem('userData');
    if (!stored) { router.push('/login'); return; }
    try {
      const parsed: UserData = JSON.parse(stored);
      if (!parsed?.isAuthenticated) { router.push('/login'); return; }
      setUserData(parsed);
      setAuthToken(tokenFrom(parsed));
    } catch {
      router.push('/login');
    }
  }, [router]);

  // Load products from SaaS to populate the form select (mirrors Settings)
  useEffect(() => {
    const loadProducts = async () => {
      try {
        if (!authToken) return;
        setProductsLoading(true);
        const saasApiUrl = process.env.NEXT_PUBLIC_SAAS_API_URL || 'https://api-saas.autonomia.site';
        const url = `${saasApiUrl}/Autonomia/Saas/Products`;
        const resp = await fetch(url, { headers: { 'Authorization': `Bearer ${authToken}` }, mode: 'cors' });
        if (!resp.ok) {
          console.error('Falha ao buscar produtos (Projects):', resp.status, resp.statusText, await resp.text());
          setProducts([]);
          return;
        }
        const json = await resp.json();
        const list: Product[] = Array.isArray(json?.data) ? json.data : [];
        setProducts(list);
      } catch (e) {
        console.error('Erro ao carregar produtos (Projects):', e);
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };
    loadProducts();
  }, [authToken]);

  // Load projects
  const reloadProjects = async () => {
    try {
      setProjectsLoading(true);
      setProjects([]);
      const resp = await fetch(`${projectApiUrl}/Autonomia/Project/ProjectsForUser`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
        mode: 'cors'
      });
      if (!resp.ok) {
        const t = await resp.text();
        console.error('Falha ao listar projetos:', resp.status, resp.statusText, t);
        if (resp.status === 401) { showToast('Sessão expirada. Faça login novamente.', 'info'); router.push('/login'); }
        return;
      }
      const json = await resp.json();
      const list: Project[] = Array.isArray(json?.data) ? json.data : [];
      setProjects(list);
    } catch (e) {
      console.error('Erro ao buscar projetos:', e);
    } finally {
      setProjectsLoading(false);
    }
  };

  useEffect(() => { if (authToken) reloadProjects(); }, [authToken]);

  // Load timeline when selecting project
  useEffect(() => {
    const loadTimeline = async () => {
      if (!selectedProjectId) { setTimeline([]); return; }
      try {
        setTimelineLoading(true);
        setTimeline([]);
        const url = `${projectApiUrl}/Autonomia/Project/ProjectTimelines?projectId=${encodeURIComponent(selectedProjectId)}`;
        const resp = await fetch(url, { headers: { 'Authorization': `Bearer ${authToken}` }, mode: 'cors' });
        if (!resp.ok) { setTimeline([]); return; }
        const json = await resp.json();
        const list: TimelineItem[] = Array.isArray(json?.data) ? json.data : [];
        setTimeline(list);
      } catch (e) {
        console.error('Erro ao carregar timeline:', e);
        setTimeline([]);
      } finally {
        setTimelineLoading(false);
      }
    };
    loadTimeline();
  }, [selectedProjectId, projectApiUrl, authToken]);

  // Gantt helpers
  const parsedTimeline: ParsedTimelineItem[] = useMemo(() => {
    return timeline.map((t): ParsedTimelineItem => {
      const start = t.start_date ? new Date(t.start_date) : null;
      const due = t.due_date ? new Date(t.due_date) : null;
      const execStart = t.execution_start_date ? new Date(t.execution_start_date) : null;
      const execEnd = t.execution_end_date ? new Date(t.execution_end_date) : null;
      return { ...t, _start: start, _due: due, _execStart: execStart, _execEnd: execEnd };
    });
  }, [timeline]);

  const dateRange = useMemo(() => {
    const dates: Date[] = [];
    parsedTimeline.forEach((t: ParsedTimelineItem) => {
      if (t._start) dates.push(t._start);
      if (t._due) dates.push(t._due);
      // include execution range if present
      if (t._execStart) dates.push(t._execStart);
      if (t._execEnd) dates.push(t._execEnd);
    });
    if (!dates.length) return null as null | { min: Date; max: Date; days: number };
    const min = new Date(Math.min(...dates.map(d => d.getTime())));
    const max = new Date(Math.max(...dates.map(d => d.getTime())));
    // ensure at least 1 day
    const days = Math.max(1, Math.ceil((max.getTime() - min.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    return { min, max, days };
  }, [parsedTimeline]);

  const pxPerDay = 24; // scale factor

  const toDayOffset = (d: Date | null) => {
    if (!dateRange || !d) return 0;
    const diff = Math.floor((d.getTime() - dateRange.min.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff) * pxPerDay;
  };

  const toWidth = (start: Date | null, due: Date | null) => {
    if (!dateRange || !start || !due) return pxPerDay; // minimal width
    const diff = Math.max(1, Math.ceil((due.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    return diff * pxPerDay;
  };

  const fmt = (d?: string | null) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('pt-BR'); } catch { return '—'; }
  };

  const isAdmin = !!userData?.user?.isAdmin;

  const openCreateForm = () => {
    if (!isAdmin) return;
    setFormMode('create');
    setSelectedProjectId("");
    setFormName("");
    setFormDescription("");
    setFormStartDate("");
    setFormEndDate("");
    setFormProductId("");
    setIsFormOpen(true);
  };

  const openEditForm = (p: Project) => {
    if (!isAdmin) return;
    setFormMode('edit');
    setSelectedProjectId(p.id);
    setFormName(p.name || "");
    setFormDescription(p.description || "");
    setFormStartDate(p.start_date ? p.start_date.slice(0,10) : "");
    setFormEndDate(p.end_date ? p.end_date.slice(0,10) : "");
    setFormProductId(p.product_id || "");
    setIsFormOpen(true);
  };

  const cancelForm = () => {
    setIsFormOpen(false);
  };

  const submitForm = async () => {
    if (!isAdmin) return;
    const payload = {
      name: formName.trim(),
      description: formDescription || null,
      start_date: formStartDate || null,
      end_date: formEndDate || null,
      product_id: formProductId.trim(),
    };
    if (!payload.name) { showToast('Informe o nome do projeto', 'error'); return; }
    if (!payload.product_id) { showToast('Informe o product_id do projeto', 'error'); return; }
    try {
      setSaving(true);
      if (formMode === 'create') {
        const resp = await fetch(`${projectApiUrl}/Autonomia/Project/Projects`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
          mode: 'cors',
          body: JSON.stringify(payload)
        });
        if (!resp.ok) { const t = await resp.text(); console.error('Falha ao criar projeto', t); showToast('Falha ao criar projeto', 'error'); return; }
        showToast('Projeto criado', 'success');
      } else {
        const resp = await fetch(`${projectApiUrl}/Autonomia/Project/Projects/${encodeURIComponent(selectedProjectId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
          mode: 'cors',
          body: JSON.stringify(payload)
        });
        if (!resp.ok) { const t = await resp.text(); console.error('Falha ao atualizar projeto', t); showToast('Falha ao atualizar projeto', 'error'); return; }
        showToast('Projeto atualizado', 'success');
      }
      setIsFormOpen(false);
      await reloadProjects();
    } catch (e) {
      console.error('Erro ao salvar projeto:', e);
      showToast('Erro ao salvar projeto', 'error');
    } finally {
      setSaving(false);
    }
  };

  // User initials for header avatar (optional)
  const userInitials = userData?.user?.name
    ? userData.user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0,2)
    : '??';

  return (
    <div className="flex h-screen bg-background dark:bg-gray-900 text-neutral-200">
      {/* Sidebar */}
      <Sidebar show={showMenu} />

      {/* Slide-over Timeline Details Panel */}
        {/* Overlay */}
        <div
          className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isTimelinePanelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setIsTimelinePanelOpen(false)}
        />
        {/* Right panel */}
        <div
          className={`fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-out ${isTimelinePanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
          aria-hidden={!isTimelinePanelOpen}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold dark:text-white">Detalhes do Item</h2>
            <button
              className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
              onClick={() => setIsTimelinePanelOpen(false)}
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>
          <div className="p-4 text-sm">
            {selectedTimeline ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <tbody>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-2 pr-4 text-neutral-400">Código</td>
                      <td className="py-2 text-white font-medium">{selectedTimeline.code}</td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-2 pr-4 text-neutral-400">Tarefa</td>
                      <td className="py-2 text-white">{selectedTimeline.task || '—'}</td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-2 pr-4 text-neutral-400">Fase</td>
                      <td className="py-2 text-white">{selectedTimeline.phase || '—'}</td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-2 pr-4 text-neutral-400">Status</td>
                      <td className="py-2 text-white">{selectedTimeline.status || '—'}</td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-2 pr-4 text-neutral-400">Responsável</td>
                      <td className="py-2 text-white">{selectedTimeline.responsible || '—'}</td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-2 pr-4 text-neutral-400">Apoiadores</td>
                      <td className="py-2 text-white">{selectedTimeline.supporters || '—'}</td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-2 pr-4 text-neutral-400">Início (Planejado)</td>
                      <td className="py-2 text-white">{fmt(selectedTimeline.start_date)}</td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-2 pr-4 text-neutral-400">Fim (Planejado)</td>
                      <td className="py-2 text-white">{fmt(selectedTimeline.due_date)}</td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-2 pr-4 text-neutral-400">Início (Execução)</td>
                      <td className="py-2 text-white">{fmt(selectedTimeline.execution_start_date)}</td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-2 pr-4 text-neutral-400">Fim (Execução)</td>
                      <td className="py-2 text-white">{fmt(selectedTimeline.execution_end_date)}</td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-2 pr-4 text-neutral-400">Dependências</td>
                      <td className="py-2 text-white">{selectedTimeline.dependencies || '—'}</td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-2 pr-4 text-neutral-400">Critério de Aceite</td>
                      <td className="py-2 text-white">{selectedTimeline.acceptance_criteria || '—'}</td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-2 pr-4 text-neutral-400">Evidência/Link</td>
                      <td className="py-2 text-white">{selectedTimeline.evidence_link || '—'}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 text-neutral-400">Marco?</td>
                      <td className="py-2 text-white">{selectedTimeline.milestone ? 'Sim' : 'Não'}</td>
                    </tr>
                    {selectedTimeline.notes && (
                      <tr>
                        <td className="py-2 pr-4 text-neutral-400 align-top">Notas</td>
                        <td className="py-2 text-white whitespace-pre-wrap">{selectedTimeline.notes}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-neutral-400">Selecione um item do gráfico para ver os detalhes.</div>
            )}
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <button
              className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white"
              onClick={() => setIsTimelinePanelOpen(false)}
            >
              Fechar
            </button>
          </div>
        </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col">
        {/* Slide-over Project Form */}
        {/* Overlay */}
        <div
          className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isFormOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={cancelForm}
        />
        {/* Right panel */}
        <div
          className={`fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-out ${isFormOpen ? 'translate-x-0' : 'translate-x-full'}`}
          aria-hidden={!isFormOpen}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold dark:text-white">{formMode === 'create' ? 'Incluir Projeto' : 'Alterar Projeto'}</h2>
            <button
              className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
              onClick={cancelForm}
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <label className="block text-sm mb-1 dark:text-gray-200">Nome</label>
              <input value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nome do projeto" />
            </div>
            <div>
              <label className="block text-sm mb-1 dark:text-gray-200">Descrição</label>
              <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]" placeholder="Descrição" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1 dark:text-gray-200">Início</label>
                <input type="date" value={formStartDate} onChange={(e) => setFormStartDate(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm mb-1 dark:text-gray-200">Fim</label>
                <input type="date" value={formEndDate} onChange={(e) => setFormEndDate(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label htmlFor="product-select" className="block text-sm mb-1 dark:text-gray-200">Produto</label>
              <select
                id="product-select"
                className="select-clean w-full"
                disabled={productsLoading}
                value={formProductId || ''}
                onChange={(e) => setFormProductId(e.target.value)}
              >
                <option value="" disabled>
                  {productsLoading ? 'Carregando produtos...' : 'Selecione um produto'}
                </option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="secondary" className="bg-gray-700 hover:bg-gray-600 text-white" onClick={cancelForm}>Cancelar</Button>
              <Button className="bg-blue-600 hover:bg-blue-500 text-white" onClick={submitForm} disabled={saving}>Salvar</Button>
            </div>
          </div>
        </div>

        {/* Header (fixed, animated, same as Settings) */}
        <header className={`fixed top-0 left-0 right-0 z-[60] flex items-center h-16 bg-gray-800 text-white px-4 transition-all duration-400 ease-out ${showHeader ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}`}>
          {/* Logo */}
          <div className="px-2 flex items-center">
            <Image src="/images/logo.png" alt="Autonom.ia Logo" width={28} height={28} />
          </div>
          {/* Project selector */}
          <div className="flex-1 px-2">
            <div className="max-w-xl flex items-center gap-2">
              <select
                id="projects-select"
                className="select-clean w-full"
                disabled={projectsLoading}
                value={selectedProjectId || ''}
                onChange={(e) => setSelectedProjectId(e.target.value)}
              >
                <option value="" disabled>
                  {projectsLoading ? 'Carregando projetos...' : 'Selecione um projeto'}
                </option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {isAdmin && (
                <Button
                  type="button"
                  variant="secondary"
                  className="bg-blue-600 hover:bg-blue-500 text-white"
                  onClick={openCreateForm}
                  title="Incluir projeto"
                >
                  <Plus className="h-4 w-4 mr-1" /> Incluir
                </Button>
              )}
              {isAdmin && (
                <Button
                  type="button"
                  variant="secondary"
                  className="bg-gray-700 hover:bg-gray-600 text-white"
                  onClick={() => {
                    const p = projects.find(x => x.id === selectedProjectId);
                    if (p) openEditForm(p);
                  }}
                  disabled={!selectedProjectId}
                  title="Editar projeto selecionado"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          {/* Right user info (optional) */}
          <div className="flex items-center gap-2">
            <span className="text-sm hidden sm:inline">{userData?.user?.name || 'Usuário'}</span>
            <div className="h-8 w-8 rounded-full bg-white/20 text-white flex items-center justify-center text-xs">{userInitials}</div>
          </div>
        </header>

        {/* Content */}
        <main className={`flex-1 overflow-y-auto p-6 pt-20 ml-20 transition-all duration-400 ease-out ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          

          {/* Timeline section (only when a project is selected) */}
          {selectedProjectId && (
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10">
              <div className="rounded-lg border border-neutral-800/60 bg-neutral-900/40 overflow-hidden">
                <div className="px-4 py-3 border-b border-neutral-800/60 flex items-center justify-between">
                  <div className="text-sm font-medium">Cronograma do Projeto</div>
                </div>
                <div className="p-4">
                  {timelineLoading && (<div className="text-sm text-neutral-400">Carregando cronograma…</div>)}
                  {!timelineLoading && !!timeline.length && (
                    <div className="w-full overflow-x-auto">
                      {/* Header scale */}
                      {dateRange && (
                        <div className="min-w-[600px]" style={{ width: Math.max(600, dateRange.days * pxPerDay + 264) }}>
                          <div className="flex text-xs text-neutral-400 pl-[16.5rem]">
                            {Array.from({ length: dateRange.days }).map((_, i) => (
                              <div key={i} className="border-l border-neutral-800/60 text-center" style={{ width: pxPerDay }}>
                                {i % 7 === 0 ? new Date(dateRange.min.getTime() + i * 86400000).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : ''}
                              </div>
                            ))}
                          </div>
                          {/* Rows */}
                          <div className="mt-2 space-y-2">
                            {parsedTimeline.map((t: ParsedTimelineItem) => (
                              <div
                                key={t.code}
                                className="relative cursor-pointer hover:bg-neutral-800/30 rounded"
                                onClick={() => { setSelectedTimeline(t); setIsTimelinePanelOpen(true); }}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setSelectedTimeline(t); setIsTimelinePanelOpen(true); } }}
                              >
                                {/* Full-row horizontal lines spanning description + bars */}
                                <div className="pointer-events-none absolute inset-y-0 left-0 right-0 border-t border-b border-neutral-800/60" />
                                <div className="flex items-start gap-3 mb-1 pl-2 pr-2">
                                  <div className="w-[16.5rem] shrink-0">
                                    <div className="text-xs text-neutral-400">{t.code}</div>
                                    <div className="text-sm text-white whitespace-normal break-words" title={t.task || t.phase || ''}>{t.task || t.phase || '—'}</div>
                                    <div className="text-xs text-neutral-300">Status: {t.status || '—'}</div>
                                  </div>
                                  <div className="relative min-h-[2.5rem] flex-1">
                                    <button
                                      className={`absolute top-1/2 -translate-y-1/2 h-6 rounded-md px-2 text-xs font-medium text-white shadow-sm hover:opacity-90 transition-opacity ${t.milestone ? 'bg-fuchsia-600' : 'bg-indigo-600'}`}
                                      style={{ left: toDayOffset(t._start), width: toWidth(t._start, t._due) }}
                                      title={(t.task || t.phase || '') + ' • ' + (t.status || '')}
                                    >
                                      {/* Intencionalmente sem texto para não exibir informações dentro da barra */}
                                    </button>
                                    {t._execStart && t._execEnd && (
                                      <div
                                        className="absolute bottom-1 h-2 rounded-full bg-emerald-600/90 shadow-sm"
                                        style={{ left: toDayOffset(t._execStart), width: toWidth(t._execStart, t._execEnd) }}
                                        title={`Execução: ${fmt(t.execution_start_date)} — ${fmt(t.execution_end_date)}`}
                                      />
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {!dateRange && (
                        <div className="text-sm text-neutral-400">Itens sem datas válidas para montar o gráfico.</div>
                      )}
                    </div>
                  )}
                  {!timelineLoading && !timeline.length && (
                    <div className="text-sm text-neutral-400">Nenhum item de cronograma encontrado.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Toast */}
          {toast && (
            <div className={`fixed bottom-5 left-1/2 -translate-x-1/2 px-4 py-2 rounded-md text-sm shadow-lg ${toast.type === 'success' ? 'bg-emerald-600/90 text-white' : toast.type === 'error' ? 'bg-rose-600/90 text-white' : 'bg-neutral-700/90 text-white'}`}>
              {toast.message}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
