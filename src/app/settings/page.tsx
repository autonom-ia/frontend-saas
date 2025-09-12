"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pencil, Settings, Plus, LayoutDashboard, Phone, RefreshCw, ClipboardList, Megaphone } from "lucide-react";
import Image from 'next/image';

type UserData = {
  user?: {
    id?: string;
    name: string;
    email: string;
    photoUrl?: string;
    phone?: string;
    created_at?: string;
    access_profile?: string;
    isAdmin?: boolean;
  };
  email?: string; // Email armazenado durante o login
  token: string;
  isAuthenticated: boolean;
};

type Product = {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
};

type Account = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  domain?: string;
  product_id?: string;
  conversation_funnel_id?: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  // Sidebar fixo reduzido
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState<boolean>(false);
  const [selectedProductId, setSelectedProductId] = useState<string | ''>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [authToken, setAuthToken] = useState<string | undefined>(undefined);
  // Accounts state
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [accPage, setAccPage] = useState(1);
  const accPageSize = 5;
  const [isAccountFormOpen, setIsAccountFormOpen] = useState(false);
  const [accountFormMode, setAccountFormMode] = useState<'create' | 'edit'>('edit');
  const [accountFormName, setAccountFormName] = useState('');
  const [accountFormEmail, setAccountFormEmail] = useState('');
  const [accountFormPhone, setAccountFormPhone] = useState('');
  const [accountFormDomain, setAccountFormDomain] = useState('');
  const [accountFormFunnelId, setAccountFormFunnelId] = useState<string>('');
  // moved selectedAccountId state above for steps loader
  // Conversation Funnels
  type Funnel = { id: string; name: string; description?: string };
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [funnelsLoading, setFunnelsLoading] = useState<boolean>(false);
  // Funnel create form state
  const [isFunnelFormOpen, setIsFunnelFormOpen] = useState<boolean>(false);
  const [funnelFormName, setFunnelFormName] = useState<string>('');
  const [funnelFormDescription, setFunnelFormDescription] = useState<string>('');
  const [funnelSaving, setFunnelSaving] = useState<boolean>(false);
  // Funnel steps section (below accounts)
  const [steps, setSteps] = useState<Array<{ id: string; name: string; description?: string }>>([]);
  const [stepsLoading, setStepsLoading] = useState<boolean>(false);
  const [stepsPage, setStepsPage] = useState<number>(1);
  const stepsPageSize = accPageSize; // mirror accounts grid
  // Estado para edição/criação de etapa do funil
  const [isStepFormOpen, setIsStepFormOpen] = useState(false);
  const [stepFormMode, setStepFormMode] = useState<'create' | 'edit'>('edit');
  const [selectedStepId, setSelectedStepId] = useState<string>('');
  const [stepFormName, setStepFormName] = useState('');
  const [stepFormDescription, setStepFormDescription] = useState('');
  // Estado para settings (mensagens) da etapa
  const [isStepSettingsOpen, setIsStepSettingsOpen] = useState(false);
  type StepMessage = {
    id?: string | number;
    conversation_funnel_step_id?: number;
    shipping_time?: string;
    shipping_order?: number;
    message_instruction?: string;
  } & Record<string, unknown>;
  const [stepMessages, setStepMessages] = useState<StepMessage[]>([]);
  const [stepMessagesLoading, setStepMessagesLoading] = useState(false);
  const [stepSaving, setStepSaving] = useState(false);
  // Criação de mensagem da etapa
  const [isCreatingStepMessage, setIsCreatingStepMessage] = useState(false);
  const [newStepMessageShippingTime, setNewStepMessageShippingTime] = useState<string>('');
  const [newStepMessageShippingOrder, setNewStepMessageShippingOrder] = useState<number | ''>('');
  const [newStepMessageInstruction, setNewStepMessageInstruction] = useState<string>('');
  const [savingNewStepMessage, setSavingNewStepMessage] = useState<boolean>(false);
  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };
  // ======= Step Message Creation (Settings of Step) =======
  const startCreateStepMessage = () => {
    setIsCreatingStepMessage(true);
    setNewStepMessageShippingTime('');
    setNewStepMessageShippingOrder('');
    setNewStepMessageInstruction('');
  };

  const cancelCreateStepMessage = () => {
    setIsCreatingStepMessage(false);
    setNewStepMessageShippingTime('');
    setNewStepMessageShippingOrder('');
    setNewStepMessageInstruction('');
  };

  const createStepMessage = async () => {
    if (!selectedStepId) { showToast('Selecione uma etapa', 'error'); return; }
    const shipping_time = (newStepMessageShippingTime || '').trim();
    const shipping_order = newStepMessageShippingOrder === '' ? undefined : Number(newStepMessageShippingOrder);
    const message_instruction = (newStepMessageInstruction || '').trim();
    if (!message_instruction) { showToast('Informe as instruções da mensagem', 'error'); return; }
    const name = `Mensagem ${shipping_order ?? (stepMessages.length + 1)}`;
    const description = message_instruction;
    try {
      setSavingNewStepMessage(true);
      const saasApiUrl = process.env.NEXT_PUBLIC_SAAS_API_URL || 'https://api-saas.autonomia.site';
      const tokenToUse = authToken || (() => {
        try {
          const stored = localStorage.getItem('userData');
          if (!stored) return undefined;
          const parsed = JSON.parse(stored);
          return parsed.IdToken || parsed.token || parsed.AccessToken;
        } catch { return undefined; }
      })();
      const resp = await fetch(`${saasApiUrl}/Autonomia/Saas/ConversationFunnelStepMessages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenToUse}`
        },
        body: JSON.stringify({
          conversation_funnel_step_id: selectedStepId,
          name,
          description,
          shipping_time,
          shipping_order,
          message_instruction
        })
      });
      if (!resp.ok) {
        const t = await resp.text();
        console.error('Falha ao criar mensagem da etapa:', resp.status, resp.statusText, t);
        showToast('Falha ao criar mensagem da etapa', 'error');
        return;
      }
      const json = await resp.json();
      const created = json?.data as StepMessage | undefined;
      if (created?.id) {
        setStepMessages((prev: StepMessage[]) => [created, ...prev]);
        showToast('Mensagem criada', 'success');
      }
      cancelCreateStepMessage();
    } catch (e) {
      console.error('Erro ao criar mensagem da etapa:', e);
      showToast('Erro ao criar mensagem da etapa', 'error');
    } finally {
      setSavingNewStepMessage(false);
    }
  };
  // Normalizar domínio: se subdomínio for "portal", considerar "autonomia"
  const normalizeDomain = (dom?: string): string => {
    const d = (dom || '').trim().toLowerCase();
    return d === 'portal' ? 'autonomia' : (dom || '');
  };
  const [selectedAccountId, setSelectedAccountId] = useState<string | ''>('');
  const [selectedAccountFunnelName, setSelectedAccountFunnelName] = useState<string>('');
  const [selectedAccountFunnelIsDefault, setSelectedAccountFunnelIsDefault] = useState<boolean>(false);
  // Animations for grids
  const [showAccountsGrid, setShowAccountsGrid] = useState(false);
  const [showFunnelGrid, setShowFunnelGrid] = useState(false);

  // Debug logs to validate visibility of "Incluir etapa" button and funnel state
  useEffect(() => {
    try {
      const acc = accounts.find(a => a.id === selectedAccountId);
      const hasFunnel = !!acc?.conversation_funnel_id;
      const isAdmin = !!userData?.user?.isAdmin;
      const canShowInclude = isAdmin && !selectedAccountFunnelIsDefault && hasFunnel;
      console.debug('Funnel include button visibility', {
        selectedAccountId,
        isAdmin,
        selectedAccountFunnelIsDefault,
        hasFunnel,
        stepsCount: steps?.length ?? 0,
        canShowInclude,
      });
    } catch (e) {
      console.debug('Funnel include debug error', e);
    }
  }, [selectedAccountId, userData?.user?.isAdmin, selectedAccountFunnelIsDefault, accounts, steps]);
  // UI staged entrance: show base -> header -> menu
  const [showHeader, setShowHeader] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setShowHeader(true), 180);
    const t2 = setTimeout(() => setShowMenu(true), 420);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  // Helper to truncate long texts with ellipsis
  const truncate = (text: string, max: number = 100): string => {
    if (!text) return '';
    return text.length > max ? text.slice(0, max) + '…' : text;
  };
  // Animate Accounts grid when product is selected
  useEffect(() => {
    if (selectedProductId) {
      setShowAccountsGrid(false);
      const t = setTimeout(() => setShowAccountsGrid(true), 160);
      return () => clearTimeout(t);
    } else {
      setShowAccountsGrid(false);
    }
  }, [selectedProductId]);
  // Animate Funnel grid when a selected account with funnel is present and steps loaded state changes
  useEffect(() => {
    const hasFunnel = !!(selectedAccountId && accounts.find(a => a.id === selectedAccountId)?.conversation_funnel_id);
    if (hasFunnel) {
      setShowFunnelGrid(false);
      const t = setTimeout(() => setShowFunnelGrid(true), 220);
      return () => clearTimeout(t);
    } else {
      setShowFunnelGrid(false);
    }
  }, [selectedAccountId, accounts]);
  // Carregar steps do funil quando a conta selecionada mudar
  useEffect(() => {
    const loadSteps = async () => {
      if (!selectedAccountId) {
        setSteps([]);
        setSelectedAccountFunnelName('');
        setSelectedAccountFunnelIsDefault(false);
        return;
      }
      const acc = accounts.find(a => a.id === selectedAccountId);
      if (!acc || !acc.conversation_funnel_id) {
        setSteps([]);
        setSelectedAccountFunnelName('');
        setSelectedAccountFunnelIsDefault(false);
        return;
      }
      try {
        setStepsLoading(true);
        setSteps([]);
        setStepsPage(1);
        const saasApiUrl = process.env.NEXT_PUBLIC_SAAS_API_URL || 'https://api-saas.autonomia.site';
        const tokenToUse = authToken || (() => {
          try {
            const stored = localStorage.getItem('userData');
            if (!stored) return undefined;
            const parsed = JSON.parse(stored);
            return parsed.IdToken || parsed.token || parsed.AccessToken;
          } catch { return undefined; }
        })();
        // Buscar steps por accountId
        const stepsResp = await fetch(`${saasApiUrl}/Autonomia/Saas/ConversationFunnelSteps?accountId=${encodeURIComponent(selectedAccountId)}`, {
          headers: { 'Authorization': `Bearer ${tokenToUse}` },
          mode: 'cors'
        });
        if (stepsResp.ok) {
          const sj = await stepsResp.json();
          const list = Array.isArray(sj?.data) ? sj.data : [];
          setSteps(list);
        } else {
          const t = await stepsResp.text();
          console.error('Falha ao buscar steps do funil:', stepsResp.status, stepsResp.statusText, t);
          setSteps([]);
        }
        // Nome do funil para o título
        try {
          const funnelResp = await fetch(`${saasApiUrl}/Autonomia/Saas/ConversationFunnels/${encodeURIComponent(acc.conversation_funnel_id)}`, {
            headers: { 'Authorization': `Bearer ${tokenToUse}` },
            mode: 'cors'
          });
          if (funnelResp.ok) {
            const fj = await funnelResp.json();
            const isDef = !!fj?.data?.is_default;
            console.debug('Fetched funnel details', {
              accountId: selectedAccountId,
              funnelId: acc.conversation_funnel_id,
              name: fj?.data?.name,
              is_default: fj?.data?.is_default,
            });
            setSelectedAccountFunnelName(fj?.data?.name || '');
            setSelectedAccountFunnelIsDefault(isDef);
          } else {
            console.debug('Funnel details request not ok', funnelResp.status, funnelResp.statusText);
            setSelectedAccountFunnelName('');
            setSelectedAccountFunnelIsDefault(false);
          }
        } catch (e) {
          console.debug('Error parsing funnel details', e);
          setSelectedAccountFunnelName('');
          setSelectedAccountFunnelIsDefault(false);
        }
      } catch (e) {
        console.error('Erro ao carregar steps do funil:', e);
        setSteps([]);
      } finally {
        setStepsLoading(false);
      }
    };
    loadSteps();
  }, [selectedAccountId, accounts, authToken]);
  // Product Parameters (Settings panel)
  const [isParamPanelOpen, setIsParamPanelOpen] = useState(false);

  // Abrir formulário para criar nova etapa (usuário padrão)
  const openCreateStepForm = () => {
    // Abrir formulário de criação de etapa (agora habilitado para admin quando funil não é default)
    console.debug('openCreateStepForm clicked', { isAdmin: userData?.user?.isAdmin, selectedAccountId });
    setStepFormMode('create');
    setSelectedStepId('');
    setStepFormName('');
    setStepFormDescription('');
    setIsStepFormOpen(true);
  };
  const [productParams, setProductParams] = useState<Array<{ id: string; name: string; value?: string }>>([]);
  const [productParamsLoading, setProductParamsLoading] = useState(false);
  // Create product parameter inline row state
  const [isCreatingProductParam, setIsCreatingProductParam] = useState(false);
  const [newProductParamName, setNewProductParamName] = useState('');
  const [newProductParamValue, setNewProductParamValue] = useState('');
  const [savingNewProductParam, setSavingNewProductParam] = useState(false);

  // Account Parameters (Settings por conta)
  const [isAccountParamPanelOpen, setIsAccountParamPanelOpen] = useState(false);
  const [accountParams, setAccountParams] = useState<Array<{ id: string; name: string; value?: string }>>([]);
  const [accountParamsLoading, setAccountParamsLoading] = useState(false);
  const [accountParamsAccountId, setAccountParamsAccountId] = useState<string | ''>('');
  const [accountSaving, setAccountSaving] = useState(false);
  const [isCreatingAccountParam, setIsCreatingAccountParam] = useState(false);
  const [newAccountParamName, setNewAccountParamName] = useState('');
  const [newAccountParamValue, setNewAccountParamValue] = useState('');
  const [savingNewAccountParam, setSavingNewAccountParam] = useState(false);
  // Debug: parâmetros que afetam a visibilidade dos botões "Incluir nos parâmetros"
  useEffect(() => {
    const isAdmin = !!userData?.user?.isAdmin;
    const accountIncludeVisible = !!(!isCreatingAccountParam && isAdmin && isAccountParamPanelOpen);
    const productIncludeVisible = !!(!isCreatingProductParam && isAdmin && isParamPanelOpen);
    console.log('[Settings] Include buttons visibility', {
      accountIncludeVisible,
      productIncludeVisible,
      isAdmin,
      isCreatingAccountParam,
      isCreatingProductParam,
      isAccountParamPanelOpen,
      isParamPanelOpen,
    });
  }, [userData?.user?.isAdmin, isCreatingAccountParam, isCreatingProductParam, isAccountParamPanelOpen, isParamPanelOpen]);

  // Inbox lateral panel
  type InboxItem = { id?: string; name: string; status?: 'open'|'close'|'connecting'|'unknown'; notFound?: boolean };
  const [isInboxPanelOpen, setIsInboxPanelOpen] = useState(false);
  const [inboxes, setInboxes] = useState<InboxItem[]>([]);
  const [inboxesLoading, setInboxesLoading] = useState(false);
  const [inboxPanelAccount, setInboxPanelAccount] = useState<Account | null>(null);
  // Dados de conexão (QR Code e Pairing Code) pós sincronização
  const [connectInfo, setConnectInfo] = useState<{ instance?: string; base64?: string; pairingCode?: string } | null>(null);
  const [connectMethod, setConnectMethod] = useState<'qrcode' | 'pairing'>('qrcode');
  const [syncingInstance, setSyncingInstance] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [pollingUntil, setPollingUntil] = useState<number | null>(null);
  const [connectionSuccess, setConnectionSuccess] = useState(false);

  const fetchInboxStatus = async (domain: string, instance: string): Promise<InboxItem['status']> => {
    try {
      console.debug('fetchInboxStatus:call', { domain, instance });
      const tokenToUse = authToken || (() => {
        try { const stored = localStorage.getItem('userData'); if (!stored) return undefined; const parsed = JSON.parse(stored); return parsed.IdToken || parsed.token || parsed.AccessToken; } catch { return undefined; }
      })();
      const apiUrl = process.env.NEXT_PUBLIC_EVOLUTION_API_URL || process.env.NEXT_PUBLIC_API_URL;
      const url = `${apiUrl}/Autonomia/Evolution/ConnectionState?domain=${encodeURIComponent(domain)}&instance=${encodeURIComponent(instance)}`;
      const resp = await fetch(url, { headers: { 'Authorization': `Bearer ${tokenToUse}` }, mode: 'cors' });
      if (resp.status === 404) return 'unknown';
      if (!resp.ok) return 'unknown';
      const j = await resp.json();
      const rawState = (j?.data?.state
        ?? j?.state
        ?? j?.instance?.state
        ?? j?.instance?.State
        ?? j?.connectionState
        ?? j?.status
        ?? (typeof j === 'string' ? j : ''));
      const state = String(rawState).toLowerCase();
      let mapped: InboxItem['status'] = 'unknown';
      if (['open','connected','conectado'].includes(state)) mapped = 'open';
      else if (['connecting','conectando'].includes(state)) mapped = 'connecting';
      else if (['close','closed','disconnected','desconectado'].includes(state)) mapped = 'close';
      console.debug('fetchInboxStatus:parsed', { raw: j, state, mapped });
      return mapped;
    } catch { return 'unknown'; }
  };

  const openAccountInboxPanel = async (acc: Account) => {
    if (!userData?.user?.isAdmin) return;
    setInboxPanelAccount(acc);
    setIsInboxPanelOpen(true);
    try {
      setInboxesLoading(true);
      const tokenToUse = authToken || (() => {
        try {
          const stored = localStorage.getItem('userData');
          if (!stored) return undefined;
          const parsed = JSON.parse(stored);
          return parsed.IdToken || parsed.token || parsed.AccessToken;
        } catch { return undefined; }
      })();
      // Buscar inboxes por accountId
      const saasApiUrl = process.env.NEXT_PUBLIC_SAAS_API_URL || 'https://api-saas.autonomia.site';
      const resp = await fetch(`${saasApiUrl}/Autonomia/Saas/Inboxes?accountId=${encodeURIComponent(acc.id)}`, { headers: { 'Authorization': `Bearer ${tokenToUse}` }, mode: 'cors' });
      let list: InboxItem[] = [];
      if (resp.ok) {
        const j = await resp.json();
        type SaasInbox = { id?: string; name?: string };
        const data: SaasInbox[] = Array.isArray(j?.data) ? j.data as SaasInbox[] : [];
        list = data.map((it) => ({ id: it?.id, name: String(it?.name ?? '') }));
      }
      // Fallback: se não houver inbox, usar o telefone da account
      if (!list.length && acc.phone) {
        list = [{ name: acc.phone }];
      }
      console.debug('openAccountInboxPanel:list', { accountId: acc.id, domain: acc.domain, list });
      // Buscar status de cada item
      const domain = normalizeDomain(acc.domain || '');
      const withStatus = await Promise.all(list.map(async (it) => {
        const st = domain && it.name ? await fetchInboxStatus(domain, it.name) : 'unknown';
        return { ...it, status: st, notFound: st === 'unknown' };
      }));
      setInboxes(withStatus);
    } catch (e) {
      console.error('Erro ao carregar inboxes/estado:', e);
      setInboxes([]);
    } finally {
      setInboxesLoading(false);
    }
  };

  const syncInboxInstance = async (instanceName: string) => {
    if (!inboxPanelAccount) return;
    try {
      setSyncingInstance(instanceName);
      const tokenToUse = authToken || (() => {
        try {
          const stored = localStorage.getItem('userData');
          if (!stored) return undefined;
          const parsed = JSON.parse(stored);
          return parsed.IdToken || parsed.token || parsed.AccessToken;
        } catch { return undefined; }
      })();
      const apiUrl = process.env.NEXT_PUBLIC_EVOLUTION_API_URL || process.env.NEXT_PUBLIC_API_URL;
      const url = `${apiUrl}/Autonomia/Evolution/CreateInstance`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenToUse}` },
        mode: 'cors',
        body: JSON.stringify({ domain: normalizeDomain(inboxPanelAccount.domain || ''), instanceName: instanceName })
      });
      if (!resp.ok) {
        const t = await resp.text();
        console.error('Falha ao sincronizar instância:', resp.status, resp.statusText, t);
        showToast('Falha ao sincronizar instância', 'error');
        return;
      }
      // Ler resposta para capturar QR base64 e pairingCode
      type CreateInstanceResp = { base64?: string; pairingCode?: string; data?: { base64?: string; pairingCode?: string } };
      let payload: CreateInstanceResp = {};
      try { payload = await resp.json() as CreateInstanceResp; } catch {}
      const base64 = payload?.base64 || payload?.data?.base64 || '';
      const pairingCode = payload?.pairingCode || payload?.data?.pairingCode || '';
      setConnectInfo({ instance: instanceName, base64, pairingCode });
      setConnectMethod(base64 ? 'qrcode' : 'pairing');
      showToast('Instância sincronizada. Atualizando estado...', 'success');
      // Refresh status for this item
      const st = await fetchInboxStatus(normalizeDomain(inboxPanelAccount.domain || ''), instanceName);
      setInboxes(prev => prev.map(it => it.name === instanceName ? { ...it, status: st, notFound: st === 'unknown' } : it));

      // Iniciar polling se QR foi gerado
      if (base64) {
        setConnectionSuccess(false);
        setPolling(true);
        setPollingUntil(Date.now() + 120000); // 2 minutos
      }
    } catch (e) {
      console.error('Erro ao sincronizar instância:', e);
      showToast('Erro ao sincronizar instância', 'error');
    }
    finally {
      setSyncingInstance(null);
    }
  };

  // Polling a cada 20s por até 2 minutos para detectar conexão da instância
  useEffect(() => {
    if (!polling || !connectInfo?.instance || !connectInfo?.base64 || !inboxPanelAccount) return;
    const instance = connectInfo.instance;
    const domain = inboxPanelAccount.domain || '';
    let stopped = false;
    const interval = setInterval(async () => {
      if (stopped) return;
      try {
        const st = await fetchInboxStatus(normalizeDomain(domain), instance);
        setInboxes(prev => prev.map(it => it.name === instance ? { ...it, status: st, notFound: st === 'unknown' } : it));
        if (st === 'open') {
          setConnectionSuccess(true);
          setPolling(false);
        }
      } catch (err) {
        console.warn('Polling connection state failed', err);
      }
    }, 20000);
    // timeout global
    const timeout = setTimeout(() => { setPolling(false); }, Math.max(0, (pollingUntil || 0) - Date.now()));
    return () => {
      stopped = true;
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [polling, pollingUntil, connectInfo?.instance, connectInfo?.base64, inboxPanelAccount]);

  // Abrir painel de parâmetros de conta
  const openAccountSettingsPanel = async (accountId: string) => {
    if (!accountId) return;
    setSelectedAccountId(accountId);
    setAccountParamsAccountId(accountId);
    setIsAccountParamPanelOpen(true);
    try {
      setAccountParamsLoading(true);
      const saasApiUrl = process.env.NEXT_PUBLIC_SAAS_API_URL || 'https://api-saas.autonomia.site';
      const tokenToUse = authToken || (() => {
        try {
          const stored = localStorage.getItem('userData');
          if (!stored) return undefined;
          const parsed = JSON.parse(stored);
          return parsed.IdToken || parsed.token || parsed.AccessToken;
        } catch { return undefined; }
      })();
      const resp = await fetch(`${saasApiUrl}/Autonomia/Saas/AccountParameters?accountId=${encodeURIComponent(accountId)}`, {
        headers: { 'Authorization': `Bearer ${tokenToUse}` },
        mode: 'cors'
      });
      if (!resp.ok) {
        const t = await resp.text();
        console.error('Falha ao buscar parâmetros da conta:', resp.status, resp.statusText, t);
        setAccountParams([]);
        return;
      }
      const json = await resp.json();
      setAccountParams(Array.isArray(json?.data) ? json.data : []);
    } catch (e) {
      console.error('Erro ao carregar parâmetros da conta:', e);
    } finally {
      setAccountParamsLoading(false);
    }
  };

  // Abrir formulário de criação de account
  const openAccountCreateForm = () => {
    setAccountFormMode('create');
    setSelectedAccountId('');
    setAccountFormName('');
    setAccountFormEmail('');
    setAccountFormPhone('');
    setAccountFormDomain('');
    setAccountFormFunnelId('');
    setIsAccountFormOpen(true);
    if (funnels.length === 0) {
      (async () => {
        try {
          setFunnelsLoading(true);
          const saasApiUrl = process.env.NEXT_PUBLIC_SAAS_API_URL || 'https://api-saas.autonomia.site';
          const tokenToUse = authToken || (() => {
            try {
              const stored = localStorage.getItem('userData');
              if (!stored) return undefined;
              const parsed = JSON.parse(stored);
              return parsed.IdToken || parsed.token || parsed.AccessToken;
            } catch { return undefined; }
          })();
          const resp = await fetch(`${saasApiUrl}/Autonomia/Saas/ConversationFunnels?defaultOnly=true`, {
            headers: { 'Authorization': `Bearer ${tokenToUse}` },
            mode: 'cors'
          });
          if (!resp.ok) {
            const t = await resp.text();
            console.error('Falha ao listar conversation funnels:', resp.status, resp.statusText, t);
            setFunnels([]);
          } else {
            const json = await resp.json();
            setFunnels(Array.isArray(json?.data) ? json.data : []);
          }
        } catch (e) {
          console.error('Erro ao buscar conversation funnels:', e);
        } finally {
          setFunnelsLoading(false);
        }
      })();
    }
  };

  // Atualizar valor do parâmetro de conta (onBlur)
  const updateAccountParameterValue = async (parameterId: string, newValue: string) => {
    if (!userData?.user?.isAdmin) return;
    // Atualização otimista
    setAccountParams(prev => prev.map(p => p.id === parameterId ? { ...p, value: newValue } : p));
    try {
      const saasApiUrl = process.env.NEXT_PUBLIC_SAAS_API_URL || 'https://api-saas.autonomia.site';
      const tokenToUse = authToken || (() => {
        try {
          const stored = localStorage.getItem('userData');
          if (!stored) return undefined;
          const parsed = JSON.parse(stored);
          return parsed.IdToken || parsed.token || parsed.AccessToken;
        } catch { return undefined; }
      })();
      const url = `${saasApiUrl}/Autonomia/Saas/AccountParameters/${encodeURIComponent(parameterId)}`;
      const resp = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenToUse}`
        },
        body: JSON.stringify({ value: newValue })
      });
      if (!resp.ok) {
        const t = await resp.text();
        console.error('Falha ao atualizar parâmetro da conta:', resp.status, resp.statusText, t);
        showToast('Falha ao atualizar parâmetro da conta', 'error');
      } else {
        showToast('Parâmetro da conta atualizado', 'success');
      }
    } catch (e) {
      console.error('Erro ao atualizar parâmetro da conta:', e);
      showToast('Erro ao atualizar parâmetro da conta', 'error');
    }
  };

  // Criar parâmetro de conta
  const startCreateAccountParam = () => {
    setIsCreatingAccountParam(true);
    setNewAccountParamName('');
    setNewAccountParamValue('');
  };

  const cancelCreateAccountParam = () => {
    setIsCreatingAccountParam(false);
    setNewAccountParamName('');
    setNewAccountParamValue('');
  };

  const createAccountParameter = async () => {
    if (!userData?.user?.isAdmin) return;
    const accountId = accountParamsAccountId || selectedAccountId;
    if (!accountId) return;
    const name = newAccountParamName.trim();
    const value = newAccountParamValue;
    if (!name) {
      showToast('Informe o nome do parâmetro', 'error');
      return;
    }
    try {
      setSavingNewAccountParam(true);
      const saasApiUrl = process.env.NEXT_PUBLIC_SAAS_API_URL || 'https://api-saas.autonomia.site';
      const tokenToUse = authToken || (() => {
        try {
          const stored = localStorage.getItem('userData');
          if (!stored) return undefined;
          const parsed = JSON.parse(stored);
          return parsed.IdToken || parsed.token || parsed.AccessToken;
        } catch { return undefined; }
      })();
      const resp = await fetch(`${saasApiUrl}/Autonomia/Saas/AccountParameters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenToUse}`
        },
        body: JSON.stringify({
          account_id: accountId,
          name,
          value
        })
      });
      if (!resp.ok) {
        const t = await resp.text();
        console.error('Falha ao criar parâmetro da conta:', resp.status, resp.statusText, t);
        showToast('Falha ao criar parâmetro da conta', 'error');
        return;
      }
      const json = await resp.json();
      const created = json?.data;
      if (created?.id) {
        setAccountParams(prev => [created, ...prev]);
        showToast('Parâmetro da conta criado', 'success');
      }
      cancelCreateAccountParam();
    } catch (e) {
      console.error('Erro ao criar parâmetro da conta:', e);
      showToast('Erro ao criar parâmetro da conta', 'error');
    } finally {
      setSavingNewAccountParam(false);
    }
  };

  // Atualizar valor do parâmetro de produto imediatamente ao alterar
  const updateProductParameterValue = async (parameterId: string, newValue: string) => {
    if (!userData?.user?.isAdmin) return;
    // Atualização otimista do estado
    setProductParams(prev => prev.map(p => p.id === parameterId ? { ...p, value: newValue } : p));

    try {
      const saasApiUrl = process.env.NEXT_PUBLIC_SAAS_API_URL || 'https://api-saas.autonomia.site';
      const tokenToUse = authToken || (() => {
        try {
          const stored = localStorage.getItem('userData');
          if (!stored) return undefined;
          const parsed = JSON.parse(stored);
          return parsed.IdToken || parsed.token || parsed.AccessToken;
        } catch { return undefined; }
      })();

      const url = `${saasApiUrl}/Autonomia/Saas/ProductParameters/${encodeURIComponent(parameterId)}`;
      const resp = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenToUse}`
        },
        body: JSON.stringify({ value: newValue })
      });

      if (!resp.ok) {
        const t = await resp.text();
        console.error('Falha ao atualizar parâmetro:', resp.status, resp.statusText, t);
        showToast('Falha ao atualizar parâmetro do produto', 'error');
      } else {
        showToast('Parâmetro do produto atualizado', 'success');
      }
    } catch (e) {
      console.error('Erro ao atualizar parâmetro de produto:', e);
      showToast('Erro ao atualizar parâmetro do produto', 'error');
    }
  };

  const openSettingsPanel = async () => {
    if (!selectedProductId) return;
    setIsParamPanelOpen(true);
    try {
      setProductParamsLoading(true);
      const saasApiUrl = process.env.NEXT_PUBLIC_SAAS_API_URL || 'https://api-saas.autonomia.site';
      const tokenToUse = authToken || (() => {
        try {
          const stored = localStorage.getItem('userData');
          if (!stored) return undefined;
          const parsed = JSON.parse(stored);
          return parsed.IdToken || parsed.token || parsed.AccessToken;
        } catch { return undefined; }
      })();
      const resp = await fetch(`${saasApiUrl}/Autonomia/Saas/ProductParameters?productId=${encodeURIComponent(selectedProductId)}` ,{
        headers: { 'Authorization': `Bearer ${tokenToUse}` },
        mode: 'cors'
      });
      if (!resp.ok) {
        const t = await resp.text();
        console.error('Falha ao buscar parâmetros de produto:', resp.status, resp.statusText, t);
        setProductParams([]);
        return;
      }
      const json = await resp.json();
      setProductParams(Array.isArray(json?.data) ? json.data : []);
    } catch (e) {
      console.error('Erro ao carregar parâmetros de produto:', e);
    } finally {
      setProductParamsLoading(false);
    }
  };

  const startCreateProductParam = () => {
    setIsCreatingProductParam(true);
    setNewProductParamName('');
    setNewProductParamValue('');
  };

  const cancelCreateProductParam = () => {
    setIsCreatingProductParam(false);
    setNewProductParamName('');
    setNewProductParamValue('');
  };

  const createProductParameter = async () => {
    if (!selectedProductId) return;
    const name = newProductParamName.trim();
    const value = newProductParamValue;
    if (!name) {
      showToast('Informe o nome do parâmetro', 'error');
      return;
    }
    try {
      setSavingNewProductParam(true);
      const saasApiUrl = process.env.NEXT_PUBLIC_SAAS_API_URL || 'https://api-saas.autonomia.site';
      const tokenToUse = authToken || (() => {
        try {
          const stored = localStorage.getItem('userData');
          if (!stored) return undefined;
          const parsed = JSON.parse(stored);
          return parsed.IdToken || parsed.token || parsed.AccessToken;
        } catch { return undefined; }
      })();
      const resp = await fetch(`${saasApiUrl}/Autonomia/Saas/ProductParameters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenToUse}`
        },
        body: JSON.stringify({
          product_id: selectedProductId,
          name,
          value
        })
      });
      if (!resp.ok) {
        const t = await resp.text();
        console.error('Falha ao criar parâmetro de produto:', resp.status, resp.statusText, t);
        showToast('Falha ao criar parâmetro do produto', 'error');
        return;
      }
      const json = await resp.json();
      const created = json?.data;
      if (created?.id) {
        setProductParams(prev => [created, ...prev]);
        showToast('Parâmetro do produto criado', 'success');
      }
      cancelCreateProductParam();
    } catch (e) {
      console.error('Erro ao criar parâmetro de produto:', e);
      showToast('Erro ao criar parâmetro do produto', 'error');
    } finally {
      setSavingNewProductParam(false);
    }
  };

  useEffect(() => {
    // Verificar autenticação do usuário
    const storedData = localStorage.getItem('userData');
    
    if (!storedData) {
      // Redirecionar para login se não houver dados armazenados
      router.push('/login');
      return;
    }

    try {
      const parsedData = JSON.parse(storedData);
      if (!parsedData.isAuthenticated) {
        router.push('/login');
        return;
      }
      
      // Já temos dados básicos de autenticação
      setUserData(parsedData);
      
      // Preparar token de autenticação (mesmo usado na busca por email)
      const tokenComputed: string | undefined = parsedData.IdToken || parsedData.token || parsedData.AccessToken;
      setAuthToken(tokenComputed);

      // Busca detalhada do usuário foi movida para Monitoring

      // Buscar lista de produtos do módulo SaaS (usa o MESMO token do login)
      const fetchProducts = async () => {
        try {
          setProductsLoading(true);
          // Garantir que usamos SEMPRE o endpoint do SaaS (não o API de auth)
          const saasApiUrl = process.env.NEXT_PUBLIC_SAAS_API_URL || 'https://api-saas.autonomia.site';
          if (!process.env.NEXT_PUBLIC_SAAS_API_URL) {
            console.warn('NEXT_PUBLIC_SAAS_API_URL não definido. Usando fallback https://api-saas.autonomia.site');
          }

          if (!saasApiUrl) {
            console.warn('URL da API SaaS não configurada. Defina NEXT_PUBLIC_SAAS_API_URL ou NEXT_PUBLIC_API_URL.');
            setProductsLoading(false);
            return;
          }

          const url = `${saasApiUrl}/Autonomia/Saas/Products`;
          console.log('Buscando produtos em:', url);

          const resp = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${tokenComputed}`
            },
            mode: 'cors'
          });

          if (!resp.ok) {
            const t = await resp.text();
            console.error('Falha ao buscar produtos:', resp.status, resp.statusText, t);
            if (resp.status === 401) {
              showToast('Sessão expirada. Faça login novamente.', 'info');
              router.push('/login');
            } else if (resp.status === 404) {
              showToast('Usuário não encontrado.', 'error');
            } else {
              showToast('Erro ao carregar produtos', 'error');
            }
            setProducts([]);
            setProductsLoading(false);
            return;
          }

          const json = await resp.json();
          // Esperado: { success: true, data: Product[] }
          const list: Product[] = Array.isArray(json?.data) ? json.data : [];
          setProducts(list);
          if (list.length === 0) {
            showToast('Nenhum produto disponível para seu usuário', 'info');
          }
        } catch (err) {
          console.error('Erro ao buscar produtos SaaS:', err);
        } finally {
          setProductsLoading(false);
        }
      };

      fetchProducts();
    } catch (error) {
      console.error('Erro ao analisar dados do usuário:', error);
      router.push('/login');
    }
  }, [router]);

  // Carregar accounts quando um produto for selecionado
  useEffect(() => {
    const loadAccounts = async () => {
      if (!selectedProductId) {
        setAccounts([]);
        return;
      }
      try {
        setAccountsLoading(true);
        const saasApiUrl = process.env.NEXT_PUBLIC_SAAS_API_URL || 'https://api-saas.autonomia.site';
        const tokenToUse = authToken || (() => {
          try {
            const stored = localStorage.getItem('userData');
            if (!stored) return undefined;
            const parsed = JSON.parse(stored);
            return parsed.IdToken || parsed.token || parsed.AccessToken;
          } catch { return undefined; }
        })();
        const resp = await fetch(`${saasApiUrl}/Autonomia/Saas/Accounts?productId=${encodeURIComponent(selectedProductId)}`, {
          headers: { 'Authorization': `Bearer ${tokenToUse}` },
          mode: 'cors'
        });
        if (!resp.ok) {
          const t = await resp.text();
          console.error('Falha ao buscar contas:', resp.status, resp.statusText, t);
          setAccounts([]);
          return;
        }
        const json = await resp.json();
        setAccounts(Array.isArray(json?.data) ? json.data : []);
        setAccPage(1);
      } catch (e) {
        console.error('Erro ao carregar contas:', e);
      } finally {
        setAccountsLoading(false);
      }
    };
    loadAccounts();
  }, [selectedProductId, authToken]);

  // Abrir formulário de edição de account
  const openAccountEditForm = (acc: Account) => {
    if (!userData?.user?.isAdmin) return;
    setAccountFormMode('edit');
    setSelectedAccountId(acc.id);
    setAccountFormName(acc.name || '');
    setAccountFormEmail(acc.email || '');
    setAccountFormPhone(acc.phone || '');
    setAccountFormDomain(acc.domain || '');
    setAccountFormFunnelId(acc.conversation_funnel_id || '');
    setIsAccountFormOpen(true);
    // Lazy load funnels on first open
    if (funnels.length === 0) {
      (async () => {
        try {
          setFunnelsLoading(true);
          const saasApiUrl = process.env.NEXT_PUBLIC_SAAS_API_URL || 'https://api-saas.autonomia.site';
          const tokenToUse = authToken || (() => {
            try {
              const stored = localStorage.getItem('userData');
              if (!stored) return undefined;
              const parsed = JSON.parse(stored);
              return parsed.IdToken || parsed.token || parsed.AccessToken;
            } catch { return undefined; }
          })();
          const resp = await fetch(`${saasApiUrl}/Autonomia/Saas/ConversationFunnels?defaultOnly=true&accountId=${encodeURIComponent(acc.id)}` , {
            headers: { 'Authorization': `Bearer ${tokenToUse}` },
            mode: 'cors'
          });
          if (!resp.ok) {
            const t = await resp.text();
            console.error('Falha ao listar conversation funnels:', resp.status, resp.statusText, t);
            setFunnels([]);
          } else {
            const json = await resp.json();
            setFunnels(Array.isArray(json?.data) ? json.data : []);
          }
        } catch (e) {
          console.error('Erro ao buscar conversation funnels:', e);
        } finally {
          setFunnelsLoading(false);
        }
      })();
    }
  };

  // Abrir formulário para criar novo funil: fecha o form de conta e abre o form de funil
  const openFunnelCreateForm = () => {
    if (!userData?.user?.isAdmin) return;
    setIsAccountFormOpen(false);
    setFunnelFormName('');
    setFunnelFormDescription('');
    setIsFunnelFormOpen(true);
  };

  // Salvar novo funil e relacionar
  const saveFunnelAndLink = async () => {
    const name = funnelFormName.trim();
    const description = funnelFormDescription.trim();
    if (!name || !description) {
      showToast('Informe nome e descrição do funil', 'error');
      return;
    }
    try {
      setFunnelSaving(true);
      const saasApiUrl = process.env.NEXT_PUBLIC_SAAS_API_URL || 'https://api-saas.autonomia.site';
      const tokenToUse = authToken || (() => {
        try {
          const stored = localStorage.getItem('userData');
          if (!stored) return undefined;
          const parsed = JSON.parse(stored);
          return parsed.IdToken || parsed.token || parsed.AccessToken;
        } catch { return undefined; }
      })();
      // 1) Criar o funil
      const createResp = await fetch(`${saasApiUrl}/Autonomia/Saas/ConversationFunnels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenToUse}` },
        mode: 'cors',
        body: JSON.stringify({ name, description })
      });
      if (!createResp.ok) {
        const t = await createResp.text();
        console.error('Falha ao criar funil:', createResp.status, createResp.statusText, t);
        showToast('Falha ao criar funil', 'error');
        return;
      }
      const cj = await createResp.json();
      const created = cj?.data as Funnel | undefined;
      if (!created?.id) {
        showToast('Funil criado mas sem ID retornado', 'error');
        return;
      }

      // 2) Se estiver editando uma conta existente, atualizar a conta para relacionar
      if (selectedAccountId) {
        const updateResp = await fetch(`${saasApiUrl}/Autonomia/Saas/Accounts/${encodeURIComponent(selectedAccountId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenToUse}` },
          mode: 'cors',
          body: JSON.stringify({ conversation_funnel_id: created.id })
        });
        if (!updateResp.ok) {
          const t = await updateResp.text();
          console.error('Falha ao atualizar conta com funil', updateResp.status, updateResp.statusText, t);
          showToast('Funil criado, mas falhou ao vincular na conta', 'error');
        } else {
          showToast('Funil criado e vinculado à conta', 'success');
          // refresh account list in memory
          setAccounts(prev => prev.map(a => a.id === selectedAccountId ? { ...a, conversation_funnel_id: created.id } : a));
          setSelectedAccountFunnelName(created.name);
        }
        // Fechar todos os painéis laterais
        setIsFunnelFormOpen(false);
        setIsAccountFormOpen(false);
      } else {
        // Caso criação de conta (sem accountId ainda), apenas preencher o select e reabrir o form de conta
        if (!funnels.find(f => f.id === created.id)) {
          setFunnels(prev => [created, ...prev]);
        }
        setAccountFormFunnelId(created.id);
        showToast('Funil criado. Continue preenchendo a conta.', 'success');
        // Fechar todos os painéis laterais
        setIsFunnelFormOpen(false);
        setIsAccountFormOpen(false);
      }
    } catch (e) {
      console.error('Erro ao criar/vincular funil:', e);
      showToast('Erro ao criar/vincular funil', 'error');
    } finally {
      setFunnelSaving(false);
    }
  };

  // Salvar account (criação/edição)
  const handleSaveAccount = async () => {
    if (!userData?.user?.isAdmin) { showToast('Ação permitida apenas para administradores', 'error'); return; }
    try {
      setAccountSaving(true);
      const saasApiUrl = process.env.NEXT_PUBLIC_SAAS_API_URL || 'https://api-saas.autonomia.site';
      const tokenToUse = authToken || (() => {
        try {
          const stored = localStorage.getItem('userData');
          if (!stored) return undefined;
          const parsed = JSON.parse(stored);
          return parsed.IdToken || parsed.token || parsed.AccessToken;
        } catch {
          return undefined;
        }
      })();

      if (!tokenToUse) {
        console.error('Token de autenticação não encontrado. Não é possível salvar o produto.');
        showToast('Token ausente para salvar produto', 'error');
        return;
      }

      const url = accountFormMode === 'create'
        ? `${saasApiUrl}/Autonomia/Saas/Accounts`
        : `${saasApiUrl}/Autonomia/Saas/Accounts/${selectedAccountId}`;
      const method = accountFormMode === 'create' ? 'POST' : 'PUT';
      const payload: Record<string, unknown> = {
        name: accountFormName,
        email: accountFormEmail,
        phone: accountFormPhone,
        domain: accountFormDomain,
        conversation_funnel_id: accountFormFunnelId || null,
      };
      if (accountFormMode === 'create') {
        payload.product_id = selectedProductId;
      }
      const resp = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenToUse}`
        },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        const t = await resp.text();
        console.error('Falha ao salvar account:', resp.status, resp.statusText, t);
        showToast('Falha ao salvar conta', 'error');
        return;
      }
      const json = await resp.json();
      const updated = json?.data;
      if (updated?.id) {
        if (accountFormMode === 'create') {
          setAccounts(prev => [updated, ...prev]);
          setAccPage(1);
        } else {
          setAccounts(prev => prev.map(a => a.id === updated.id ? { ...a, ...updated } : a));
        }
      }
      setIsAccountFormOpen(false);
      showToast('Conta salva com sucesso', 'success');
    } catch (e) {
      console.error('Erro ao salvar account:', e);
      showToast('Erro ao salvar conta', 'error');
    } finally {
      setAccountSaving(false);
    }
  };

  // Abrir formulário em modo criar
  const openCreateForm = () => {
    setFormMode('create');
    setFormName('');
    setFormDescription('');
    setIsFormOpen(true);
  };

  // Abrir formulário em modo edição
  const openEditForm = () => {
    if (!selectedProductId) return;
    const product = products.find(p => p.id === selectedProductId);
    setFormMode('edit');
    setFormName(product?.name || '');
    setFormDescription(product?.description || '');
    setIsFormOpen(true);
  };

  // Salvar (criar/atualizar) produto
  const handleSaveProduct = async () => {
    if (!userData?.user?.isAdmin) { showToast('Ação permitida apenas para administradores', 'error'); return; }
    try {
      setSaving(true);
      const saasApiUrl = process.env.NEXT_PUBLIC_SAAS_API_URL || 'https://api-saas.autonomia.site';
      const tokenToUse = authToken || (() => {
        try {
          const stored = localStorage.getItem('userData');
          if (!stored) return undefined;
          const parsed = JSON.parse(stored);
          return parsed.IdToken || parsed.token || parsed.AccessToken;
        } catch {
          return undefined;
        }
      })();

      if (!tokenToUse) {
        console.error('Token de autenticação não encontrado. Não é possível salvar o produto.');
        showToast('Token ausente para salvar produto', 'error');
        return;
      }

      const url = formMode === 'create'
        ? `${saasApiUrl}/Autonomia/Saas/Products`
        : `${saasApiUrl}/Autonomia/Saas/Products/${selectedProductId}`;

      const method = formMode === 'create' ? 'POST' : 'PUT';
      const resp = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenToUse}`
        },
        body: JSON.stringify({ name: formName, description: formDescription })
      });

      if (!resp.ok) {
        const t = await resp.text();
        console.error('Falha ao salvar produto:', resp.status, resp.statusText, t);
        showToast('Falha ao salvar produto', 'error');
        return;
      }

      // Atualiza a lista local
      const json = await resp.json();
      if (formMode === 'create' && json?.data) {
        setProducts(prev => [json.data, ...prev]);
        setSelectedProductId(json.data.id);
      } else if (formMode === 'edit' && json?.data) {
        setProducts(prev => prev.map(p => p.id === json.data.id ? json.data : p));
      } else {
        // Fallback: refetch
        try {
          const refetch = await fetch(`${saasApiUrl}/Autonomia/Saas/Products`, {
            headers: { 'Authorization': `Bearer ${tokenToUse}` },
            mode: 'cors'
          });
          if (refetch.ok) {
            const rj = await refetch.json();
            setProducts(Array.isArray(rj?.data) ? rj.data : []);
          }
        } catch {}
      }

      setIsFormOpen(false);
      showToast('Produto salvo com sucesso', 'success');
    } catch (e) {
      console.error('Erro ao salvar produto:', e);
      showToast('Erro ao salvar produto', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!userData) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  // Extrair iniciais do nome do usuário (se disponível)
  const userInitials = userData.user?.name
    ? userData.user.name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : '??';

  return (
    <div className="flex h-screen bg-background dark:bg-gray-900">
      {/* Menu Lateral */}
      <div className="w-20 h-full bg-transparent dark:bg-gray-900">
        {/* Barra vertical com bordas arredondadas e ícones */}
        <div className={`h-full flex items-center justify-center transition-all duration-400 ease-out ${showMenu ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5'}`}>
          <div className="flex flex-col items-center gap-3 rounded-full bg-gray-800/60 dark:bg-gray-700/60 p-2">
            <Button
              className="h-10 w-10 p-0 rounded-full bg-transparent hover:bg-gray-700/60 text-white"
              title="Monitoring"
              onClick={() => { router.push('/monitoring'); }}
            >
              <LayoutDashboard className="h-5 w-5" />
            </Button>
            <Button
              className="h-10 w-10 p-0 rounded-full bg-transparent hover:bg-gray-700/60 text-white"
              title="Settings"
              onClick={() => { router.push('/settings'); }}
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button
              className="h-10 w-10 p-0 rounded-full bg-transparent hover:bg-gray-700/60 text-white"
              title="Projects"
              onClick={() => { router.push('/projects'); }}
            >
              <ClipboardList className="h-5 w-5" />
            </Button>
            <Button
              className="h-10 w-10 p-0 rounded-full bg-transparent hover:bg-gray-700/60 text-white"
              title="Campanhas"
              onClick={() => { router.push('/campaigns'); }}
            >
              <Megaphone className="h-5 w-5" />
            </Button>
          </div>

        </div>
      </div>
      {/* Conteúdo principal (header + main) */}
      <div className="flex-1 flex flex-col">

      {/* Slide-over Formulário de Etapa do Funil */}
      {/* Overlay com transição */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isStepFormOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsStepFormOpen(false)}
      />
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-out ${isStepFormOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!isStepFormOpen}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold dark:text-white">{stepFormMode === 'create' ? 'Nova Etapa do Funil' : 'Editar Etapa do Funil'}</h2>
          <button
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
            onClick={() => setIsStepFormOpen(false)}
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label htmlFor="step-name" className="block text-sm mb-1 dark:text-gray-200">Nome</label>
            <input id="step-name" type="text" className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" value={stepFormName} onChange={e => setStepFormName(e.target.value)} />
          </div>
          <div>
            <label htmlFor="step-desc" className="block text-sm mb-1 dark:text-gray-200">Descrição</label>
            <textarea id="step-desc" className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[100px]" value={stepFormDescription} onChange={e => setStepFormDescription(e.target.value)} />
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
          <Button variant="secondary" className="bg-gray-700 hover:bg-gray-600 text-white" onClick={() => { setIsStepFormOpen(false); }}>Fechar</Button>
          <Button className="bg-blue-600 hover:bg-blue-500 text-white" disabled={stepSaving} onClick={async () => {
            setStepSaving(true);
            try {
              const saasApiUrl = process.env.NEXT_PUBLIC_SAAS_API_URL || 'https://api-saas.autonomia.site';
              const tokenToUse = authToken || (() => {
                try {
                  const stored = localStorage.getItem('userData');
                  if (!stored) return undefined;
                  const parsed = JSON.parse(stored);
                  return parsed.IdToken || parsed.token || parsed.AccessToken;
                } catch { return undefined; }
              })();

              if (stepFormMode === 'create') {
                // Criar nova etapa vinculada ao funil da conta selecionada
                if (!selectedAccountId) { showToast('Selecione uma conta', 'error'); return; }
                const acc = accounts.find(a => a.id === selectedAccountId);
                const funnelId = acc?.conversation_funnel_id;
                if (!funnelId) { console.error('Sem conversation_funnel_id para a conta selecionada'); showToast('Conta sem funil vinculado', 'error'); return; }
                const resp = await fetch(`${saasApiUrl}/Autonomia/Saas/ConversationFunnelSteps`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenToUse}` },
                  body: JSON.stringify({ conversation_funnel_id: funnelId, name: stepFormName, description: stepFormDescription })
                });
                if (!resp.ok) {
                  const t = await resp.text();
                  console.error('Falha ao criar etapa:', resp.status, resp.statusText, t);
                  showToast('Falha ao criar etapa', 'error');
                  return;
                }
                const json = await resp.json();
                const created = json?.data;
                if (created?.id) {
                  setSteps(prev => [created, ...prev]);
                }
                setIsStepFormOpen(false);
                showToast('Etapa criada com sucesso', 'success');
              } else {
                // Editar etapa existente
                if (!selectedStepId) return;
                const resp = await fetch(`${saasApiUrl}/Autonomia/Saas/ConversationFunnelSteps/${selectedStepId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenToUse}` },
                  body: JSON.stringify({ name: stepFormName, description: stepFormDescription })
                });
                if (!resp.ok) {
                  const t = await resp.text();
                  console.error('Falha ao salvar etapa:', resp.status, resp.statusText, t);
                  showToast('Falha ao salvar etapa', 'error');
                  return;
                }
                const json = await resp.json();
                const updated = json?.data;
                if (updated?.id) {
                  setSteps(prev => prev.map(s => s.id === updated.id ? { ...s, ...updated } : s));
                }
                setIsStepFormOpen(false);
                showToast('Etapa salva com sucesso', 'success');
              }
            } catch (e) {
              console.error('Erro ao salvar etapa:', e);
              showToast('Erro ao salvar etapa', 'error');
            } finally { setStepSaving(false); }
          }}>Salvar</Button>
        </div>
      </div>

      {/* Slide-over Settings de Mensagens da Etapa */}
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isStepSettingsOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsStepSettingsOpen(false)}
      />
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-out ${isStepSettingsOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!isStepSettingsOpen}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold dark:text-white">Mensagens da Etapa</h2>
          <button
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
            onClick={() => setIsStepSettingsOpen(false)}
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
                  <th className="text-left px-4 py-2 dark:text-gray-100">Tempo de envio</th>
                  <th className="text-left px-4 py-2 dark:text-gray-100">Ordem de envio</th>
                  <th className="text-left px-4 py-2 dark:text-gray-100">Instruções da Mensagem</th>
                </tr>
              </thead>
              <tbody>
                {isCreatingStepMessage && (
                  <tr className="border-t border-gray-100 dark:border-gray-700 bg-blue-50/40 dark:bg-gray-700/30 align-top">
                    <td className="px-4 py-2 dark:text-gray-100 w-40">
                      <input
                        type="text"
                        className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: 10m, 2h, 1d"
                        value={newStepMessageShippingTime}
                        onChange={(e) => setNewStepMessageShippingTime(e.target.value)}
                      />
                    </td>
                    <td className="px-4 py-2 dark:text-gray-100 w-40">
                      <input
                        type="number"
                        className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: 1, 2, 3"
                        value={newStepMessageShippingOrder}
                        onChange={(e) => setNewStepMessageShippingOrder(e.target.value === '' ? '' : Number(e.target.value))}
                      />
                    </td>
                    <td className="px-4 py-2 dark:text-gray-100">
                      <textarea
                        className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[100px]"
                        placeholder="Descreva as instruções da mensagem"
                        value={newStepMessageInstruction}
                        onChange={(e) => setNewStepMessageInstruction(e.target.value)}
                      />
                    </td>
                  </tr>
                )}
                {stepMessagesLoading ? (
                  <tr><td className="px-4 py-3 dark:text-gray-200" colSpan={3}>Carregando...</td></tr>
                ) : stepMessages.length === 0 ? (
                  <tr><td className="px-4 py-3 dark:text-gray-200" colSpan={3}>Nenhuma mensagem encontrada.</td></tr>
                ) : (
                  stepMessages.map((m) => (
                    <tr key={m.id} className="border-t border-gray-100 dark:border-gray-700 align-top">
                      <td className="px-4 py-2 dark:text-gray-100 w-40">
                        <input
                          type="text"
                          className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={m.shipping_time ?? ''}
                          onChange={(e) => setStepMessages(prev => prev.map(x => x.id === m.id ? { ...x, shipping_time: e.target.value } : x))}
                          onBlur={async (e) => {
                            try {
                              const saasApiUrl = process.env.NEXT_PUBLIC_SAAS_API_URL || 'https://api-saas.autonomia.site';
                              const tokenToUse = authToken || (() => {
                                try {
                                  const stored = localStorage.getItem('userData');
                                  if (!stored) return undefined;
                                  const parsed = JSON.parse(stored);
                                  return parsed.IdToken || parsed.token || parsed.AccessToken;
                                } catch { return undefined; }
                              })();
                              const resp = await fetch(`${saasApiUrl}/Autonomia/Saas/ConversationFunnelStepMessages/${m.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenToUse}` },
                                body: JSON.stringify({ shipping_time: e.target.value })
                              });
                              if (resp.ok) showToast('Tempo de envio atualizado', 'success'); else showToast('Falha ao atualizar tempo de envio', 'error');
                            } catch (err) { console.error('Erro ao atualizar shipping_time:', err); }
                          }}
                          placeholder="Ex: 10m, 2h, 1d"
                        />
                      </td>
                      <td className="px-4 py-2 dark:text-gray-100 w-40">
                        <input
                          type="number"
                          className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={m.shipping_order ?? ''}
                          onChange={(e) => setStepMessages(prev => prev.map(x => x.id === m.id ? { ...x, shipping_order: Number(e.target.value) } : x))}
                          onBlur={async (e) => {
                            try {
                              const saasApiUrl = process.env.NEXT_PUBLIC_SAAS_API_URL || 'https://api-saas.autonomia.site';
                              const tokenToUse = authToken || (() => {
                                try {
                                  const stored = localStorage.getItem('userData');
                                  if (!stored) return undefined;
                                  const parsed = JSON.parse(stored);
                                  return parsed.IdToken || parsed.token || parsed.AccessToken;
                                } catch { return undefined; }
                              })();
                              const resp = await fetch(`${saasApiUrl}/Autonomia/Saas/ConversationFunnelStepMessages/${m.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenToUse}` },
                                body: JSON.stringify({ shipping_order: Number(e.target.value) })
                              });
                              if (resp.ok) showToast('Ordem de envio atualizada', 'success'); else showToast('Falha ao atualizar ordem de envio', 'error');
                            } catch (err) { console.error('Erro ao atualizar shipping_order:', err); }
                          }}
                          placeholder="Ex: 1, 2, 3"
                        />
                      </td>
                      <td className="px-4 py-2 dark:text-gray-100">
                        <textarea
                          className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[100px]"
                          value={m.message_instruction ?? ''}
                          onChange={(e) => setStepMessages(prev => prev.map(x => x.id === m.id ? { ...x, message_instruction: e.target.value } : x))}
                          onBlur={async (e) => {
                            try {
                              const saasApiUrl = process.env.NEXT_PUBLIC_SAAS_API_URL || 'https://api-saas.autonomia.site';
                              const tokenToUse = authToken || (() => {
                                try {
                                  const stored = localStorage.getItem('userData');
                                  if (!stored) return undefined;
                                  const parsed = JSON.parse(stored);
                                  return parsed.IdToken || parsed.token || parsed.AccessToken;
                                } catch { return undefined; }
                              })();
                              const resp = await fetch(`${saasApiUrl}/Autonomia/Saas/ConversationFunnelStepMessages/${m.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenToUse}` },
                                body: JSON.stringify({ message_instruction: e.target.value })
                              });
                              if (resp.ok) showToast('Instruções atualizadas', 'success'); else showToast('Falha ao atualizar instruções', 'error');
                            } catch (err) { console.error('Erro ao atualizar instruções:', err); }
                          }}
                          placeholder="Descreva as instruções da mensagem"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {userData?.user?.isAdmin && !isCreatingStepMessage && (
            <div className="mt-3 flex justify-end">
              <Button
                className="bg-blue-600 hover:bg-blue-500 text-white"
                size="sm"
                onClick={startCreateStepMessage}
                title="Incluir mensagem"
              >
                <Plus className="h-4 w-4 mr-1" /> Incluir
              </Button>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-2">
          {isCreatingStepMessage ? (
            <div className="flex items-center gap-2">
              <Button
                className="bg-blue-600 hover:bg-blue-500 text-white"
                onClick={createStepMessage}
                disabled={savingNewStepMessage}
                title="Salvar mensagem"
              >
                Salvar
              </Button>
              <Button
                variant="secondary"
                className="bg-gray-700 hover:bg-gray-600 text-white"
                onClick={cancelCreateStepMessage}
                disabled={savingNewStepMessage}
              >
                Cancelar
              </Button>
            </div>
          ) : <span />}
          <div className="flex items-center gap-2">
            {!isCreatingStepMessage && userData?.user?.isAdmin && (
              <Button
                className="bg-blue-600 hover:bg-blue-500 text-white"
                size="sm"
                onClick={startCreateStepMessage}
                title="Incluir mensagem"
              >
                Incluir mensagem
              </Button>
            )}
            <Button variant="secondary" className="bg-gray-700 hover:bg-gray-600 text-white" onClick={() => { setIsStepSettingsOpen(false); }}>Fechar</Button>
          </div>
        </div>
      </div>

      {/* Painel à direita com animação de slide (Parâmetros da Conta) */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-out ${isAccountParamPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!isAccountParamPanelOpen}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold dark:text-white">Parâmetros da Conta</h2>
          <button
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
            onClick={() => setIsAccountParamPanelOpen(false)}
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
                  <th className="text-left px-4 py-2 dark:text-gray-100">Nome</th>
                  <th className="text-left px-4 py-2 dark:text-gray-100">Valor</th>
                </tr>
              </thead>
              <tbody>
                {isCreatingAccountParam && (
                  <tr className="border-t border-gray-100 dark:border-gray-700 bg-blue-50/40 dark:bg-gray-700/30">
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nome do parâmetro"
                        value={newAccountParamName}
                        onChange={(e) => setNewAccountParamName(e.target.value)}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Valor"
                        value={newAccountParamValue}
                        onChange={(e) => setNewAccountParamValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') createAccountParameter(); }}
                      />
                    </td>
                  </tr>
                )}
                {accountParamsLoading ? (
                  <tr><td className="px-4 py-3 dark:text-gray-200" colSpan={2}>Carregando...</td></tr>
                ) : accountParams.length === 0 ? (
                  <tr><td className="px-4 py-3 dark:text-gray-200" colSpan={2}>Nenhum parâmetro encontrado.</td></tr>
                ) : (
                  accountParams.map(item => (
                    <tr key={item.id} className="border-t border-gray-100 dark:border-gray-700">
                      <td className="px-4 py-2 dark:text-gray-100">{item.name}</td>
                      <td className="px-4 py-2 dark:text-gray-100">
                        {((item.value ?? '').length > 60) ? (
                          <textarea
                            className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[80px]"
                            rows={Math.min(8, Math.max(3, Math.ceil(((item.value ?? '').length) / 60)))}
                            value={item.value ?? ''}
                            onChange={(e) => setAccountParams(prev => prev.map(p => p.id === item.id ? { ...p, value: e.target.value } : p))}
                            onBlur={(e) => updateAccountParameterValue(item.id, e.target.value)}
                            placeholder="Defina o valor"
                          />
                        ) : (
                          <input
                            type="text"
                            className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={item.value ?? ''}
                            onChange={(e) => setAccountParams(prev => prev.map(p => p.id === item.id ? { ...p, value: e.target.value } : p))}
                            onBlur={(e) => updateAccountParameterValue(item.id, e.target.value)}
                            placeholder="Defina o valor"
                          />
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {userData?.user?.isAdmin && !isCreatingAccountParam && (
            <div className="mt-3 flex justify-end">
              <Button
                className="bg-blue-600 hover:bg-blue-500 text-white"
                size="sm"
                onClick={startCreateAccountParam}
                title="Incluir parâmetro"
              >
                <Plus className="h-4 w-4 mr-1" /> Incluir
              </Button>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-2">
          {isCreatingAccountParam ? (
            <div className="flex items-center gap-2">
              <Button
                className="bg-blue-600 hover:bg-blue-500 text-white"
                onClick={createAccountParameter}
                disabled={savingNewAccountParam}
                title="Salvar parâmetro"
              >
                Salvar
              </Button>
              <Button
                variant="secondary"
                className="bg-gray-700 hover:bg-gray-600 text-white"
                onClick={cancelCreateAccountParam}
                disabled={savingNewAccountParam}
              >
                Cancelar
              </Button>
            </div>
          ) : <span />}
          <div className="flex items-center gap-2">
            {!isCreatingAccountParam && userData?.user?.isAdmin && (
              <Button
                className="bg-blue-600 hover:bg-blue-500 text-white"
                size="sm"
                onClick={startCreateAccountParam}
                title="Incluir parâmetro"
              >
                Incluir nos parâmetros
              </Button>
            )}
            <Button variant="secondary" className="bg-gray-700 hover:bg-gray-600 text-white" onClick={() => { setIsAccountParamPanelOpen(false); }}>Fechar</Button>
          </div>
        </div>
      </div>

      {/* Painel à direita com animação de slide (Parâmetros do Produto) */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-out ${isParamPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!isParamPanelOpen}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold dark:text-white">Parâmetros do Produto</h2>
          <button
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
            onClick={() => setIsParamPanelOpen(false)}
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
                  <th className="text-left px-4 py-2 dark:text-gray-100">Nome</th>
                  <th className="text-left px-4 py-2 dark:text-gray-100">Valor</th>
                </tr>
              </thead>
              <tbody>
                {isCreatingProductParam && (
                  <tr className="border-t border-gray-100 dark:border-gray-700 bg-blue-50/40 dark:bg-gray-700/30">
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nome do parâmetro"
                        value={newProductParamName}
                        onChange={(e) => setNewProductParamName(e.target.value)}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Valor"
                        value={newProductParamValue}
                        onChange={(e) => setNewProductParamValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') createProductParameter(); }}
                      />
                    </td>
                  </tr>
                )}
                {productParamsLoading ? (
                  <tr><td className="px-4 py-3 dark:text-gray-200" colSpan={2}>Carregando...</td></tr>
                ) : productParams.length === 0 ? (
                  <tr><td className="px-4 py-3 dark:text-gray-200" colSpan={2}>Nenhum parâmetro encontrado.</td></tr>
                ) : (
                  productParams.map(item => (
                    <tr key={item.id} className="border-t border-gray-100 dark:border-gray-700">
                      <td className="px-4 py-2 dark:text-gray-100">{item.name}</td>
                      <td className="px-4 py-2 dark:text-gray-100">
                        {((item.value ?? '').length > 60) ? (
                          <textarea
                            className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[80px]"
                            rows={Math.min(8, Math.max(3, Math.ceil(((item.value ?? '').length) / 60)))}
                            value={item.value ?? ''}
                            onChange={(e) => userData?.user?.isAdmin && setProductParams(prev => prev.map(p => p.id === item.id ? { ...p, value: e.target.value } : p))}
                            onBlur={(e) => userData?.user?.isAdmin && updateProductParameterValue(item.id, e.target.value)}
                            disabled={!userData?.user?.isAdmin}
                            placeholder="Defina o valor"
                          />
                        ) : (
                          <input
                            type="text"
                            className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={item.value ?? ''}
                            onChange={(e) => userData?.user?.isAdmin && setProductParams(prev => prev.map(p => p.id === item.id ? { ...p, value: e.target.value } : p))}
                            onBlur={(e) => userData?.user?.isAdmin && updateProductParameterValue(item.id, e.target.value)}
                            disabled={!userData?.user?.isAdmin}
                            placeholder="Defina o valor"
                          />
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-2">
          {isCreatingProductParam ? (
            <div className="flex items-center gap-2">
              <Button
                className="bg-blue-600 hover:bg-blue-500 text-white"
                onClick={createProductParameter}
                disabled={savingNewProductParam}
                title="Salvar parâmetro"
              >
                Salvar
              </Button>
              <Button
                variant="secondary"
                className="bg-gray-700 hover:bg-gray-600 text-white"
                onClick={cancelCreateProductParam}
                disabled={savingNewProductParam}
              >
                Cancelar
              </Button>
            </div>
          ) : <span />}
          <div className="flex items-center gap-2">
            {!isCreatingProductParam && userData?.user?.isAdmin && (
              <Button
                className="bg-blue-600 hover:bg-blue-500 text-white"
                size="sm"
                onClick={startCreateProductParam}
                title="Incluir parâmetro"
              >
                Incluir nos parâmetros
              </Button>
            )}
            <Button variant="secondary" className="bg-gray-700 hover:bg-gray-600 text-white" onClick={() => { setIsParamPanelOpen(false); }}>Fechar</Button>
          </div>
        </div>
      </div>

      {/* Painel à direita com animação de slide (Parâmetros da Conta) */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-out ${isAccountParamPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!isAccountParamPanelOpen}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold dark:text-white">Parâmetros da Conta</h2>
          <button
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
            onClick={() => setIsAccountParamPanelOpen(false)}
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
                  <th className="text-left px-4 py-2 dark:text-gray-100">Nome</th>
                  <th className="text-left px-4 py-2 dark:text-gray-100">Valor</th>
                </tr>
              </thead>
              <tbody>
                {accountParamsLoading ? (
                  <tr><td className="px-4 py-3 dark:text-gray-200" colSpan={2}>Carregando...</td></tr>
                ) : accountParams.length === 0 ? (
                  <tr><td className="px-4 py-3 dark:text-gray-200" colSpan={2}>Nenhum parâmetro encontrado.</td></tr>
                ) : (
                  accountParams.map(item => (
                    <tr key={item.id} className="border-t border-gray-100 dark:border-gray-700">
                      <td className="px-4 py-2 dark:text-gray-100">{item.name}</td>
                      <td className="px-4 py-2 dark:text-gray-100">
                        {((item.value ?? '').length > 60) ? (
                          <textarea
                            className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[80px]"
                            rows={Math.min(8, Math.max(3, Math.ceil(((item.value ?? '').length) / 60)))}
                            value={item.value ?? ''}
                            onChange={(e) => setAccountParams(prev => prev.map(p => p.id === item.id ? { ...p, value: e.target.value } : p))}
                            onBlur={(e) => updateAccountParameterValue(item.id, e.target.value)}
                            placeholder="Defina o valor"
                          />
                        ) : (
                          <input
                            type="text"
                            className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={item.value ?? ''}
                            onChange={(e) => setAccountParams(prev => prev.map(p => p.id === item.id ? { ...p, value: e.target.value } : p))}
                            onBlur={(e) => updateAccountParameterValue(item.id, e.target.value)}
                            placeholder="Defina o valor"
                          />
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
          {userData?.user?.isAdmin && (
            <Button
              className="bg-blue-600 hover:bg-blue-500 text-white"
              size="sm"
              onClick={startCreateAccountParam}
              title="Incluir parâmetro"
            >
              Incluir nos parâmetros
            </Button>
          )}
          <Button variant="secondary" className="bg-gray-700 hover:bg-gray-600 text-white" onClick={() => { setIsAccountParamPanelOpen(false); }}>Fechar</Button>
        </div>
      </div>

      {/* Cabeçalho */}
        <header className={`fixed top-0 left-0 right-0 z-[60] flex items-center h-16 bg-gray-800 text-white px-4 transition-all duration-400 ease-out ${showHeader ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}`}>
          {/* Logo no header */}
          <div className="px-2 flex items-center">
            <Image src="/images/logo.png" alt="Autonom.ia Logo" width={28} height={28} />
          </div>
          {/* Seletor de produtos */}
          <div className="flex-1 px-2">
            <div className="max-w-xl flex items-center gap-2">
              <label htmlFor="products-select" className="sr-only">Produtos</label>
              <select
                id="products-select"
                className="select-clean w-full"
                disabled={productsLoading}
                value={selectedProductId || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedProductId(val);
                }}
              >
                <option value="" disabled>
                  {productsLoading ? 'Carregando produtos...' : 'Selecione um produto'}
                </option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {userData.user?.isAdmin && (
                <Button
                  type="button"
                  variant="secondary"
                  className="bg-blue-600 hover:bg-blue-500 text-white"
                  onClick={() => { setSelectedProductId(''); openCreateForm(); }}
                  title="Incluir produto"
                >
                  <Plus className="h-4 w-4 mr-1" /> Incluir
                </Button>
              )}
              {userData.user?.isAdmin && (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    className="bg-gray-700 hover:bg-gray-600 text-white"
                    onClick={openEditForm}
                    disabled={!selectedProductId}
                    title="Editar produto selecionado"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="bg-gray-700 hover:bg-gray-600 text-white"
                    onClick={openSettingsPanel}
                    disabled={!selectedProductId}
                    title="Settings do produto (parâmetros)"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm">{userData.user?.name || 'Usuário'}</span>
            <Avatar>
              {userData.user?.photoUrl ? (
                <AvatarImage src={userData.user.photoUrl} alt={userData.user?.name || 'Avatar'} />
              ) : null}
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
          </div>
      </header>

      {/* Conteúdo do Dashboard */}
      <main className="flex-1 overflow-y-auto p-6 pt-20">
          {/* Removed welcome and select product messages when no product is selected */}

          {/* Grid: Configuração de Contas (visível apenas com produto selecionado) */}
          {selectedProductId && (
            <>
            <section className={`mt-6 transition-all duration-400 ease-out ${showAccountsGrid ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold dark:text-white">Configuração de Contas</h2>
                {userData.user?.isAdmin && (
                  <Button
                    className="bg-blue-600 hover:bg-blue-500 text-white"
                    size="sm"
                    onClick={openAccountCreateForm}
                    title="Incluir conta"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Incluir
                  </Button>
                )}
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm max-h-[50vh] overflow-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                    <tr>
                      <th className="text-left px-4 py-2 dark:text-gray-100">Nome</th>
                      <th className="text-left px-4 py-2 dark:text-gray-100">Email</th>
                      <th className="text-left px-4 py-2 dark:text-gray-100">Telefone</th>
                      <th className="text-left px-4 py-2 dark:text-gray-100">Domínio</th>
                      <th className="text-right px-4 py-2 dark:text-gray-100">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accountsLoading ? (
                      <tr><td className="px-4 py-3 dark:text-gray-200" colSpan={5}>Carregando...</td></tr>
                    ) : accounts.length === 0 ? (
                      <tr><td className="px-4 py-3 dark:text-gray-200" colSpan={5}>Nenhuma conta encontrada.</td></tr>
                    ) : (
                      accounts.slice((accPage-1)*accPageSize, (accPage-1)*accPageSize + accPageSize).map(acc => (
                        <tr
                          key={acc.id}
                          className={`border-t border-gray-100 dark:border-gray-700 cursor-pointer ${selectedAccountId === acc.id ? 'bg-blue-50 dark:bg-gray-700/50' : ''}`}
                          onClick={() => setSelectedAccountId(acc.id)}
                        >
                          <td className="px-4 py-2 dark:text-gray-100">{acc.name}</td>
                          <td className="px-4 py-2 dark:text-gray-100">{acc.email || '-'}</td>
                          <td className="px-4 py-2 dark:text-gray-100">{acc.phone || '-'}</td>
                          <td className="px-4 py-2 dark:text-gray-100">{acc.domain || '-'}</td>
                          <td className="px-4 py-2 text-right">
                            {userData.user?.isAdmin && (
                              <>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="bg-gray-700 hover:bg-gray-600 text-white"
                                  onClick={(e) => { e.stopPropagation(); openAccountEditForm(acc); }}
                                  title="Editar conta"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="ml-2 bg-gray-700 hover:bg-gray-600 text-white"
                                  onClick={(e) => { e.stopPropagation(); openAccountInboxPanel(acc); }}
                                  title="Inboxes e WhatsApp"
                                >
                                  <Phone className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="ml-2 bg-gray-700 hover:bg-gray-600 text-white"
                                  onClick={(e) => { e.stopPropagation(); openAccountSettingsPanel(acc.id); }}
                                  title="Parâmetros da conta (settings)"
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {/* Paginação */}
                {accounts.length > accPageSize && (
                  <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-xs dark:text-gray-300">
                      Página {accPage} de {Math.ceil(accounts.length / accPageSize)}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        className="bg-gray-700 hover:bg-gray-600 text-white"
                        onClick={() => setAccPage(p => Math.max(1, p-1))}
                        disabled={accPage === 1}
                      >Anterior</Button>
                      <Button
                        className="bg-blue-600 hover:bg-blue-500 text-white"
                        onClick={() => setAccPage(p => Math.min(Math.ceil(accounts.length / accPageSize), p+1))}
                        disabled={accPage >= Math.ceil(accounts.length / accPageSize)}
                      >Próxima</Button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Cabeçalho Funil: quando conta não possui funil, mostrar ação para criar */}
            {selectedAccountId && !(accounts.find(a => a.id === selectedAccountId)?.conversation_funnel_id) && (
              <section className={`mt-6 transition-all duration-400 ease-out ${showFunnelGrid ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold dark:text-white">Configuração Funil Conversacional</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Nenhum funil vinculado à conta selecionada.</p>
                  </div>
                  {userData.user?.isAdmin && (
                    <Button
                      className="bg-blue-600 hover:bg-blue-500 text-white"
                      size="sm"
                      onClick={openFunnelCreateForm}
                      title="Incluir Funil"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Incluir Funil
                    </Button>
                  )}
                </div>
              </section>
            )}

            {/* Grid: Configuração Funil Conversacional (aparece apenas se conta selecionada tem funil) */}
            {selectedAccountId && (accounts.find(a => a.id === selectedAccountId)?.conversation_funnel_id) && (
              <section className={`mt-6 transition-all duration-400 ease-out ${showFunnelGrid ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold dark:text-white">Configuração Funil Conversacional</h2>
                    {selectedAccountFunnelName && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">{selectedAccountFunnelName}</p>
                    )}
                  </div>
                  {userData?.user?.isAdmin && !selectedAccountFunnelIsDefault && (
                    <Button
                      className="bg-blue-600 hover:bg-blue-500 text-white"
                      size="sm"
                      onClick={openCreateStepForm}
                      title="Incluir etapa"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Incluir
                    </Button>
                  )}
                </div>
                <div className="h-3" />
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm max-h-[50vh] overflow-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                      <tr>
                        <th className="text-left px-4 py-2 dark:text-gray-100">Nome</th>
                        <th className="text-left px-4 py-2 dark:text-gray-100">Descrição</th>
                        <th className="text-right px-4 py-2 dark:text-gray-100">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stepsLoading ? (
                        <tr><td className="px-4 py-3 dark:text-gray-200" colSpan={3}>Carregando...</td></tr>
                      ) : steps.length === 0 ? (
                        <tr><td className="px-4 py-3 dark:text-gray-200" colSpan={3}>Nenhuma etapa encontrada.</td></tr>
                      ) : (
                      steps.slice((stepsPage-1)*stepsPageSize, (stepsPage-1)*stepsPageSize + stepsPageSize).map(step => (
                        <tr key={step.id} className="border-t border-gray-100 dark:border-gray-700">
                          <td className="px-4 py-2 dark:text-gray-100">{truncate(step.name || '', 100)}</td>
                          <td className="px-4 py-2 dark:text-gray-100">{truncate(step.description || '-', 100)}</td>
                          <td className="px-4 py-2 text-right">
                            {userData.user?.isAdmin && (
                              <div className="flex justify-end gap-2">
                                {!selectedAccountFunnelIsDefault && (
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    className="bg-gray-700 hover:bg-gray-600 text-white"
                                    title="Editar etapa"
                                    onClick={() => {
                                      setStepFormMode('edit');
                                      setSelectedStepId(step.id);
                                      setStepFormName(step.name || '');
                                      setStepFormDescription(step.description || '');
                                      setIsStepFormOpen(true);
                                    }}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="bg-gray-700 hover:bg-gray-600 text-white"
                                  title="Configurações da etapa"
                                  onClick={async () => {
                                    setSelectedStepId(step.id);
                                    setIsStepSettingsOpen(true);
                                    // Buscar mensagens por accountId e filtrar por step
                                    try {
                                      setStepMessagesLoading(true);
                                      const saasApiUrl = process.env.NEXT_PUBLIC_SAAS_API_URL || 'https://api-saas.autonomia.site';
                                      const tokenToUse = authToken || (() => {
                                        try {
                                          const stored = localStorage.getItem('userData');
                                          if (!stored) return undefined;
                                          const parsed = JSON.parse(stored);
                                          return parsed.IdToken || parsed.token || parsed.AccessToken;
                                        } catch { return undefined; }
                                      })();
                                      const resp = await fetch(`${saasApiUrl}/Autonomia/Saas/ConversationFunnelStepMessages?accountId=${selectedAccountId}`, {
                                        headers: { 'Authorization': `Bearer ${tokenToUse}` },
                                        mode: 'cors'
                                      });
                                      if (!resp.ok) {
                                        const t = await resp.text();
                                        console.error('Falha ao buscar mensagens da etapa:', resp.status, resp.statusText, t);
                                        setStepMessages([]);
                                      } else {
                                        const j = await resp.json();
                                        const all = Array.isArray(j?.data) ? j.data : [];
                                        const filtered = (all as StepMessage[]).filter(m => String(m?.conversation_funnel_step_id ?? '') === String(step.id ?? ''));
                                        setStepMessages(filtered);
                                      }
                                    } catch (e) {
                                      console.error('Erro ao carregar mensagens da etapa:', e);
                                      setStepMessages([]);
                                    } finally {
                                      setStepMessagesLoading(false);
                                    }
                                  }}
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                    </tbody>
                  </table>
                  {/* Paginação */}
                  {steps.length > stepsPageSize && (
                    <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-xs dark:text-gray-300">
                        Página {stepsPage} de {Math.ceil(steps.length / stepsPageSize)}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          className="bg-gray-700 hover:bg-gray-600 text-white"
                          onClick={() => setStepsPage(p => Math.max(1, p-1))}
                          disabled={stepsPage === 1}
                        >Anterior</Button>
                        <Button
                          className="bg-blue-600 hover:bg-blue-500 text-white"
                          onClick={() => setStepsPage(p => Math.min(Math.ceil(steps.length / stepsPageSize), p+1))}
                          disabled={stepsPage >= Math.ceil(steps.length / stepsPageSize)}
                        >Próxima</Button>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}
            </>
          )}
        </main>
      </div>

      {/* Slide-over Formulário de Conta (abre da direita para a esquerda com animação) */}
      {/* Overlay com transição */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isAccountFormOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsAccountFormOpen(false)}
      />
      {/* Painel à direita com animação de slide (Conta) */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-out ${isAccountFormOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!isAccountFormOpen}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold dark:text-white">
            {accountFormMode === 'create' ? 'Adicionar Conta' : 'Editar Conta'}
          </h2>
          <button
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
            onClick={() => setIsAccountFormOpen(false)}
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label htmlFor="acc-name" className="block text-sm mb-1 dark:text-gray-200">Nome</label>
            <input
              id="acc-name"
              type="text"
              className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={accountFormName}
              onChange={(e) => setAccountFormName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="acc-email" className="block text-sm mb-1 dark:text-gray-200">Email</label>
            <input
              id="acc-email"
              type="email"
              className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={accountFormEmail}
              onChange={(e) => setAccountFormEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="acc-phone" className="block text-sm mb-1 dark:text-gray-200">Telefone</label>
            <input
              id="acc-phone"
              type="text"
              className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={accountFormPhone}
              onChange={(e) => setAccountFormPhone(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="acc-domain" className="block text-sm mb-1 dark:text-gray-200">Domínio</label>
            <input
              id="acc-domain"
              type="text"
              className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={accountFormDomain}
              onChange={(e) => setAccountFormDomain(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="acc-funnel" className="block text-sm mb-1 dark:text-gray-200">Funil Conversacional</label>
            <div className="flex items-center gap-2">
              <select
                id="acc-funnel"
                className="select-clean w-full"
                value={accountFormFunnelId}
                onChange={(e) => setAccountFormFunnelId(e.target.value)}
              >
                <option value="">Selecione um funil</option>
                {funnelsLoading ? (
                  <option value="" disabled>Carregando...</option>
                ) : (
                  funnels.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))
                )}
              </select>
              {userData?.user?.isAdmin && (
                <Button
                  type="button"
                  onClick={openFunnelCreateForm}
                  title="Incluir novo funil"
                  className="bg-blue-600 hover:bg-blue-500 text-white"
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
          <Button
            variant="secondary"
            className="bg-gray-700 hover:bg-gray-600 text-white"
            onClick={() => { setIsAccountFormOpen(false); }}
            disabled={accountSaving}
          >Cancelar</Button>
          <Button
            className="bg-blue-600 hover:bg-blue-500 text-white"
            onClick={handleSaveAccount}
            disabled={accountSaving || !accountFormName.trim()}
          >{accountSaving ? 'Salvando...' : 'Salvar'}</Button>
        </div>
      </div>

      {/* Slide-over Formulário de Produto (abre da direita para a esquerda com animação) */}
      {/* Overlay com transição */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isFormOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsFormOpen(false)}
      />
      {/* Painel à direita com animação de slide (Produto) */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-out ${isFormOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!isFormOpen}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold dark:text-white">
            {formMode === 'create' ? 'Adicionar Produto' : 'Editar Produto'}
          </h2>
          <button
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
            onClick={() => setIsFormOpen(false)}
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label htmlFor="prod-name" className="block text-sm mb-1 dark:text-gray-200">Nome</label>
            <input
              id="prod-name"
              type="text"
              className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="prod-desc" className="block text-sm mb-1 dark:text-gray-200">Descrição</label>
            <textarea
              id="prod-desc"
              rows={5}
              className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
          {/* Botões evidenciados para tema dark */}
          <Button
            variant="secondary"
            className="bg-gray-700 hover:bg-gray-600 text-white"
            onClick={() => { setIsFormOpen(false); }}
            disabled={saving}
          >Cancelar</Button>
          <Button
            className="bg-blue-600 hover:bg-blue-500 text-white"
            onClick={handleSaveProduct}
            disabled={saving || !formName.trim()}
          >{saving ? 'Salvando...' : 'Salvar'}</Button>
        </div>
      </div>

      {/* Painel de Inboxes e WhatsApp (condicional, abre da direita) */}
      {isInboxPanelOpen && (
        <>
          <div
            className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isInboxPanelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setIsInboxPanelOpen(false)}
          />
          <div
            className={`fixed right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-out ${isInboxPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
            aria-hidden={!isInboxPanelOpen}
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold dark:text-white">Inboxes e WhatsApp</h2>
              <button
                className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                onClick={() => setIsInboxPanelOpen(false)}
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
                    {inboxesLoading ? (
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
                                onClick={() => syncInboxInstance(it.name)}
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
              ) : (!inboxesLoading && inboxes.some(it => it.status !== 'open')) && (
                <div className="mt-4">
                  <div className="rounded-lg p-6 max-w-xl mx-auto border border-gray-200 dark:border-gray-700 bg-black text-white">
                    {/* Tabs */}
                    <div className="flex border-b border-white/10 mb-6">
                      <button
                        className={`px-4 py-2 transition ${connectMethod === 'qrcode' ? 'border-b-2 border-sky-500 text-white' : 'opacity-60'}`}
                        onClick={() => setConnectMethod('qrcode')}
                      >QR Code</button>
                      <button
                        className={`px-4 py-2 transition ${connectMethod === 'pairing' ? 'border-b-2 border-sky-500 text-white' : 'opacity-60'}`}
                        onClick={() => setConnectMethod('pairing')}
                      >Código de Pareamento</button>
                    </div>

                    {/* Método QR Code */}
                    {connectMethod === 'qrcode' && (
                      <div>
                        <h3 className="text-sky-400 font-semibold mb-3">Como conectar usando QR Code</h3>
                        <ul className="text-sm space-y-3">
                          <li className="flex"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-black font-bold mr-3">1</span><span>Abra o WhatsApp no seu celular</span></li>
                          <li className="flex"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-black font-bold mr-3">2</span><span>Toque em Mais opções ⋮ ou Configurações ⚙️</span></li>
                          <li className="flex"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-black font-bold mr-3">3</span><span>Selecione &quot;Aparelhos conectados&quot;</span></li>
                          <li className="flex"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-black font-bold mr-3">4</span><span>Toque em &quot;Conectar um aparelho&quot;</span></li>
                          <li className="flex"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-black font-bold mr-3">5</span><span>Aponte a câmera para o QR Code abaixo</span></li>
                        </ul>
                        <div className="mt-4 flex items-center justify-center">
                          {connectInfo?.base64 ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={connectInfo.base64} alt="QR Code" className="w-64 h-64 object-contain rounded bg-white p-2" />
                          ) : (
                            <div className="text-center text-gray-300 text-sm">
                              Gere o QR Code clicando no botão de sincronizar da instância desejada.
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Método Código de Pareamento */}
                    {connectMethod === 'pairing' && (
                      <div>
                        <h3 className="text-sky-400 font-semibold mb-3">Como conectar usando Código de Pareamento</h3>
                        <ul className="text-sm space-y-3">
                          <li className="flex"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-black font-bold mr-3">1</span><span>Abra o WhatsApp no seu celular</span></li>
                          <li className="flex"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-black font-bold mr-3">2</span><span>Toque em Mais opções ⋮ ou Configurações ⚙️</span></li>
                          <li className="flex"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-black font-bold mr-3">3</span><span>Selecione &quot;Aparelhos conectados&quot;</span></li>
                          <li className="flex"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-black font-bold mr-3">4</span><span>Toque em &quot;Conectar um aparelho&quot;</span></li>
                          <li className="flex"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-black font-bold mr-3">5</span><span>Toque em &quot;Conectar com código&quot;</span></li>
                          <li className="flex"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-black font-bold mr-3">6</span><span>Digite o código de 8 dígitos abaixo</span></li>
                        </ul>
                        <div className="mt-6 text-center">
                          {connectInfo?.pairingCode ? (
                            <div className="inline-block text-3xl tracking-widest bg-white text-black rounded px-4 py-3 font-mono">
                              {connectInfo.pairingCode}
                            </div>
                          ) : (
                            <div className="text-center text-gray-300 text-sm">
                              Gere o código clicando no botão de sincronizar da instância desejada.
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-6 text-xs text-gray-300 text-center">
                      {connectInfo?.instance ? `Instância: ${connectInfo.instance}` : 'Instância ainda não sincronizada'}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
              <Button variant="secondary" className="bg-gray-700 hover:bg-gray-600 text-white" onClick={() => { setIsInboxPanelOpen(false); }}>Fechar</Button>
            </div>
          </div>
        </>
      )}

      {/* Slide-over Formulário de Funil (abre da direita, padrão do produto) */}
      {/* Overlay com transição */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isFunnelFormOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => { setIsFunnelFormOpen(false); }}
      />
      {/* Painel à direita com animação de slide (Funil) */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-out ${isFunnelFormOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!isFunnelFormOpen}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold dark:text-white">Novo Funil</h2>
          <button
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
            onClick={() => { setIsFunnelFormOpen(false); }}
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label htmlFor="funnel-name" className="block text-sm mb-1 dark:text-gray-200">Nome</label>
            <input
              id="funnel-name"
              type="text"
              className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={funnelFormName}
              onChange={(e) => setFunnelFormName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="funnel-desc" className="block text-sm mb-1 dark:text-gray-200">Descrição</label>
            <textarea
              id="funnel-desc"
              rows={5}
              className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={funnelFormDescription}
              onChange={(e) => setFunnelFormDescription(e.target.value)}
            />
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
          <Button
            variant="secondary"
            className="bg-gray-700 hover:bg-gray-600 text-white"
            onClick={() => { setIsFunnelFormOpen(false); }}
            disabled={funnelSaving}
          >Cancelar</Button>
          <Button
            className="bg-blue-600 hover:bg-blue-500 text-white"
            onClick={saveFunnelAndLink}
            disabled={funnelSaving || !funnelFormName.trim() || !funnelFormDescription.trim()}
          >{funnelSaving ? 'Salvando...' : 'Salvar'}</Button>
        </div>
      </div>

      {/* Toast container (global) */}
      <div className={`fixed bottom-4 right-4 z-[9999] transition-all ${toast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        {toast && (
          <div className={`px-4 py-3 rounded shadow-lg text-white ${toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-gray-700'}`}>
            {toast.message}
          </div>
        )}
      </div>
      {/* Global tweak: make number input spinners match input background (light/dark) */}
      <style jsx global>{`
        /* Chrome/Safari */
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          background: transparent; /* inherit input background */
          color: inherit;
        }
        /* Let UA widgets follow theme in dark mode */
        .dark input[type="number"] { color-scheme: dark; }
        /* Firefox doesn't show spinners by default; no change needed */
      `}</style>
    </div>
  );
}
