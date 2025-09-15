"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Pencil, Settings, Plus, LayoutDashboard, Phone, ClipboardList, Megaphone } from "lucide-react";
import AccountForm from './components/AccountForm';
import ProductForm from './components/ProductForm';
import InboxPanel from './components/InboxPanel';
import Sidebar from '../../components/Sidebar';
import AccountParametersPanel from './components/AccountParametersPanel';
import ProductParametersPanel from './components/ProductParametersPanel';
import StepForm from './components/StepForm';
import StepMessagesPanel from './components/StepMessagesPanel';
import type { StepMessage } from './components/StepMessagesPanel';
import type { AccountParameter } from './components/AccountParametersPanel';
import ProductHeader from '../../components/ProductHeader';
import SelectedAccountBar from '../../components/SelectedAccountBar';

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
      const acc = accounts.find((a: Account) => a.id === selectedAccountId);
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

  // Persist and restore selected product/account across sessions
  useEffect(() => {
    try {
      const storedProduct = sessionStorage.getItem('settingsSelectedProductId');
      if (storedProduct) setSelectedProductId(storedProduct);
      const storedAccount = sessionStorage.getItem('settingsSelectedAccountId');
      if (storedAccount) setSelectedAccountId(storedAccount);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (selectedProductId) sessionStorage.setItem('settingsSelectedProductId', selectedProductId);
      else sessionStorage.removeItem('settingsSelectedProductId');
    } catch {}
  }, [selectedProductId]);

  useEffect(() => {
    try {
      if (selectedAccountId) sessionStorage.setItem('settingsSelectedAccountId', selectedAccountId);
      else sessionStorage.removeItem('settingsSelectedAccountId');
    } catch {}
  }, [selectedAccountId]);
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
  // Animate Funnel section whenever a new account is selected (regardless of having funnel)
  useEffect(() => {
    if (selectedAccountId) {
      console.debug('[Settings] Animação Funil: conta selecionada mudou', { selectedAccountId });
      setShowFunnelGrid(false);
      const t = setTimeout(() => setShowFunnelGrid(true), 220);
      return () => clearTimeout(t);
    }
    setShowFunnelGrid(false);
  }, [selectedAccountId]);
  // Carregar steps do funil quando a conta selecionada mudar
  useEffect(() => {
    const loadSteps = async () => {
      if (!selectedAccountId) {
        setSteps([]);
        setSelectedAccountFunnelName('');
        setSelectedAccountFunnelIsDefault(false);
        return;
      }
      const acc = accounts.find((a: Account) => a.id === selectedAccountId);
      console.debug('[Settings] Conta encontrada:', {
        selectedAccountId,
        accountFound: !!acc,
        accountHasFunnelId: !!acc?.conversation_funnel_id
      });
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
        const url = `${saasApiUrl}/Autonomia/Saas/ConversationFunnelSteps?accountId=${encodeURIComponent(selectedAccountId)}`;
        console.debug('[Settings] Buscando steps do funil:', { url });
        const stepsResp = await fetch(url, {
          headers: { 'Authorization': `Bearer ${tokenToUse}` },
          mode: 'cors'
        });
        if (stepsResp.ok) {
          const sj = await stepsResp.json();
          const list = Array.isArray(sj?.data) ? sj.data : [];
          console.debug('[Settings] Steps carregados:', { count: list.length });
          setSteps(list);
          // Buscar informações do funil selecionado (nome e se é default)
          const funnelResp = await fetch(`${saasApiUrl}/Autonomia/Saas/ConversationFunnels/${encodeURIComponent(acc.conversation_funnel_id)}`, {
            headers: { 'Authorization': `Bearer ${tokenToUse}` },
            mode: 'cors'
          });
          if (funnelResp.ok) {
            const fj = await funnelResp.json();
            const funnel = fj?.data;
            setSelectedAccountFunnelName(funnel?.name || '');
            setSelectedAccountFunnelIsDefault(!!funnel?.is_default);
            console.debug('[Settings] Funnel meta carregada:', { name: funnel?.name, is_default: funnel?.is_default });
          } else {
            const t = await funnelResp.text();
            console.warn('[Settings] Falha ao buscar meta do funil:', funnelResp.status, funnelResp.statusText, t);
            setSelectedAccountFunnelName('');
            setSelectedAccountFunnelIsDefault(false);
          }
        } else {
          const t = await stepsResp.text();
          console.warn('[Settings] Falha ao buscar steps:', stepsResp.status, stepsResp.statusText, t);
          setSteps([]);
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
          console.error('[Settings] Falha ao buscar contas:', resp.status, resp.statusText, t);
          setAccounts([]);
          return;
        }
        const json = await resp.json();
        const list = Array.isArray(json?.data) ? json.data : [];
        console.debug('[Settings] Accounts carregadas:', {
          productId: selectedProductId,
          count: list.length,
          first: list[0]?.id,
          firstHasFunnel: !!list[0]?.conversation_funnel_id
        });
        setAccounts(list);
        setAccPage(1);
      } catch (e) {
        console.error('[Settings] Erro ao carregar contas:', e);
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
      {/* Sidebar */}
      <Sidebar show={showMenu} />
      {/* Conteúdo principal (header + main) */}
      <div className="flex-1 flex flex-col">

      {/* Slide-over Formulário de Etapa do Funil */}
      <StepForm
        open={isStepFormOpen}
        mode={stepFormMode}
        name={stepFormName}
        description={stepFormDescription}
        saving={stepSaving}
        onClose={() => setIsStepFormOpen(false)}
        onChange={(f) => { if (f.name !== undefined) setStepFormName(f.name); if (f.description !== undefined) setStepFormDescription(f.description); }}
        onSave={async () => {
          setStepSaving(true);
          try {
            const saasApiUrl = process.env.NEXT_PUBLIC_SAAS_API_URL || 'https://api-saas.autonomia.site';
            const tokenToUse = authToken || (() => { try { const stored = localStorage.getItem('userData'); if (!stored) return undefined; const parsed = JSON.parse(stored); return parsed.IdToken || parsed.token || parsed.AccessToken; } catch { return undefined; } })();
            if (stepFormMode === 'create') {
              if (!selectedAccountId) { showToast('Selecione uma conta', 'error'); return; }
              const acc = accounts.find(a => a.id === selectedAccountId);
              const funnelId = acc?.conversation_funnel_id;
              if (!funnelId) { console.error('Sem conversation_funnel_id para a conta selecionada'); showToast('Conta sem funil vinculado', 'error'); return; }
              const resp = await fetch(`${saasApiUrl}/Autonomia/Saas/ConversationFunnelSteps`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenToUse}` }, body: JSON.stringify({ conversation_funnel_id: funnelId, name: stepFormName, description: stepFormDescription }) });
              if (!resp.ok) { const t = await resp.text(); console.error('Falha ao criar etapa:', resp.status, resp.statusText, t); showToast('Falha ao criar etapa', 'error'); return; }
              const json = await resp.json(); const created = json?.data; if (created?.id) { setSteps(prev => [created, ...prev]); }
              setIsStepFormOpen(false); showToast('Etapa criada com sucesso', 'success');
            } else {
              if (!selectedStepId) return;
              const resp = await fetch(`${saasApiUrl}/Autonomia/Saas/ConversationFunnelSteps/${selectedStepId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenToUse}` }, body: JSON.stringify({ name: stepFormName, description: stepFormDescription }) });
              if (!resp.ok) { const t = await resp.text(); console.error('Falha ao salvar etapa:', resp.status, resp.statusText, t); showToast('Falha ao salvar etapa', 'error'); return; }
              const json = await resp.json(); const updated = json?.data; if (updated?.id) { setSteps(prev => prev.map(s => s.id === updated.id ? { ...s, ...updated } : s)); }
              setIsStepFormOpen(false); showToast('Etapa salva com sucesso', 'success');
            }
          } catch (e) { console.error('Erro ao salvar etapa:', e); showToast('Erro ao salvar etapa', 'error'); }
          finally { setStepSaving(false); }
        }}
      />
 

      

      {/* Slide-over Settings de Mensagens da Etapa */}
      <StepMessagesPanel
        open={isStepSettingsOpen}
        isAdmin={!!userData?.user?.isAdmin}
        loading={stepMessagesLoading}
        isCreating={isCreatingStepMessage}
        newShippingTime={newStepMessageShippingTime}
        newShippingOrder={newStepMessageShippingOrder}
        newInstruction={newStepMessageInstruction}
        savingNew={savingNewStepMessage}
        messages={stepMessages}
        onClose={() => setIsStepSettingsOpen(false)}
        onStartCreate={startCreateStepMessage}
        onCancelCreate={cancelCreateStepMessage}
        onSaveCreate={createStepMessage}
        onChangeNew={(f) => {
          if (f.shipping_time !== undefined) setNewStepMessageShippingTime(f.shipping_time);
          if (f.shipping_order !== undefined) setNewStepMessageShippingOrder(f.shipping_order);
          if (f.message_instruction !== undefined) setNewStepMessageInstruction(f.message_instruction);
        }}
        onChangeMessage={(id, fields) => {
          setStepMessages(prev => prev.map(x => x.id === id ? { ...x, ...fields } : x));
        }}
        onBlurMessageField={async (id, fields) => {
          try {
            const saasApiUrl = process.env.NEXT_PUBLIC_SAAS_API_URL || 'https://api-saas.autonomia.site';
            const tokenToUse = authToken || (() => { try { const stored = localStorage.getItem('userData'); if (!stored) return undefined; const parsed = JSON.parse(stored); return parsed.IdToken || parsed.token || parsed.AccessToken; } catch { return undefined; } })();
            const body: Partial<Pick<StepMessage, 'shipping_time' | 'shipping_order' | 'message_instruction'>> = {};
            if (fields.shipping_time !== undefined) body.shipping_time = fields.shipping_time;
            if (fields.shipping_order !== undefined) body.shipping_order = fields.shipping_order;
            if (fields.message_instruction !== undefined) body.message_instruction = fields.message_instruction;
            const resp = await fetch(`${saasApiUrl}/Autonomia/Saas/ConversationFunnelStepMessages/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenToUse}` }, body: JSON.stringify(body) });
            if (resp.ok) showToast('Mensagem atualizada', 'success'); else showToast('Falha ao atualizar mensagem', 'error');
          } catch (err) { console.error('Erro ao atualizar mensagem:', err); }
        }}
      />

      <ProductParametersPanel
        open={isParamPanelOpen}
        isAdmin={!!userData?.user?.isAdmin}
        loading={productParamsLoading}
        items={productParams}
        isCreating={isCreatingProductParam}
        newName={newProductParamName}
        newValue={newProductParamValue}
        savingNew={savingNewProductParam}
        onClose={() => setIsParamPanelOpen(false)}
        onStartCreate={startCreateProductParam}
        onCancelCreate={cancelCreateProductParam}
        onSaveCreate={createProductParameter}
        onChangeNewName={(v) => setNewProductParamName(v)}
        onChangeNewValue={(v) => setNewProductParamValue(v)}
        onChangeItemValue={(id, v) => setProductParams(prev => prev.map(p => p.id === id ? { ...p, value: v } : p))}
        onBlurItemSave={(id, v) => updateProductParameterValue(id, v)}
      />

      <AccountParametersPanel
        open={isAccountParamPanelOpen}
        isAdmin={!!userData?.user?.isAdmin}
        loading={accountParamsLoading}
        items={accountParams as AccountParameter[]}
        isCreating={isCreatingAccountParam}
        newName={newAccountParamName}
        newValue={newAccountParamValue}
        savingNew={savingNewAccountParam}
        onClose={() => setIsAccountParamPanelOpen(false)}
        onStartCreate={startCreateAccountParam}
        onCancelCreate={cancelCreateAccountParam}
        onSaveCreate={createAccountParameter}
        onChangeNewName={(v) => setNewAccountParamName(v)}
        onChangeNewValue={(v) => setNewAccountParamValue(v)}
        onChangeItemValue={(id, v) => setAccountParams(prev => prev.map(p => p.id === id ? { ...p, value: v } : p))}
        onBlurItemSave={(id, v) => updateAccountParameterValue(id, v)}
      />

      {/* Cabeçalho (componente reutilizável) */}
      <ProductHeader
        products={products}
        productsLoading={productsLoading}
        selectedProductId={selectedProductId}
        isAdmin={!!userData?.user?.isAdmin}
        userName={userData?.user?.name}
        userPhotoUrl={userData?.user?.photoUrl}
        userInitials={userInitials}
        onChangeProduct={(val) => {
          // Troca de produto: limpar seleção de conta e estado do funil
          setSelectedProductId(val);
          setSelectedAccountId('');
          setSteps([]);
          setSelectedAccountFunnelName('');
          setSelectedAccountFunnelIsDefault(false);
        }}
        onCreateProduct={() => { setSelectedProductId(''); openCreateForm(); }}
        onEditProduct={openEditForm}
        onOpenProductSettings={openSettingsPanel}
      />

      {/* Conteúdo do Dashboard */}
      <main className="flex-1 overflow-y-auto p-6 pt-16 ml-20">
          {/* Removed welcome and select product messages when no product is selected */}

          {/* Selected Account bar (sticky) */}
          {selectedProductId && selectedAccountId && (
            <SelectedAccountBar
              name={accounts.find(a => a.id === selectedAccountId)?.name || 'Conta'}
              isAdmin={!!userData?.user?.isAdmin}
              onEdit={() => { const acc = accounts.find(a => a.id === selectedAccountId); if (acc) openAccountEditForm(acc); }}
              onInbox={() => { const acc = accounts.find(a => a.id === selectedAccountId); if (acc) openAccountInboxPanel(acc); }}
              onSettings={() => { const acc = accounts.find(a => a.id === selectedAccountId); if (acc) openAccountSettingsPanel(acc.id); }}
              onChangeAccount={() => { setSelectedAccountId(''); setShowAccountsGrid(false); setTimeout(() => setShowAccountsGrid(true), 120); }}
            />
          )}

          {/* Spacer to avoid content sitting under the sticky bar */}
          {selectedProductId && selectedAccountId && (<div className="h-8" />)}

          {/* Grid: Configuração de Contas (visível apenas sem conta selecionada) */}
          {selectedProductId && (
            <>
            {!selectedAccountId && (
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
                    </tr>
                  </thead>
                  <tbody>
                    {accountsLoading ? (
                      <tr><td className="px-4 py-3 dark:text-gray-200" colSpan={4}>Carregando...</td></tr>
                    ) : accounts.length === 0 ? (
                      <tr><td className="px-4 py-3 dark:text-gray-200" colSpan={4}>Nenhuma conta encontrada.</td></tr>
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
            )}

            {/* Cabeçalho Funil: quando conta não possui funil (sem steps), mostrar ação para criar */}
            {selectedAccountId && !stepsLoading && steps.length === 0 && (
              <section key={`no-funnel-${selectedAccountId}`} className={`mt-6 transition-all duration-400 ease-out opacity-100 translate-y-0`}>
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

            {/* Grid: Configuração Funil Conversacional (forçar render quando há conta selecionada) */}
            {selectedAccountId && (
              <section key={`funnel-grid-${selectedAccountId}`} className={`mt-6 transition-all duration-400 ease-out opacity-100 translate-y-0`}>
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
                                        const all = Array.isArray(j?.data) ? (j.data as StepMessage[]) : [];
                                        const filtered = all.filter(m => String(m?.conversation_funnel_step_id ?? '') === String(step.id ?? ''));
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
      <AccountForm
        open={isAccountFormOpen}
        mode={accountFormMode}
        name={accountFormName}
        email={accountFormEmail}
        phone={accountFormPhone}
        domain={accountFormDomain}
        funnelId={accountFormFunnelId}
        funnels={funnels}
        funnelsLoading={funnelsLoading}
        isAdmin={!!userData?.user?.isAdmin}
        saving={accountSaving}
        onChange={(f) => {
          if (f.name !== undefined) setAccountFormName(f.name);
          if (f.email !== undefined) setAccountFormEmail(f.email);
          if (f.phone !== undefined) setAccountFormPhone(f.phone);
          if (f.domain !== undefined) setAccountFormDomain(f.domain);
          if (f.funnelId !== undefined) setAccountFormFunnelId(f.funnelId);
        }}
        onSave={handleSaveAccount}
        onClose={() => setIsAccountFormOpen(false)}
        onOpenCreateFunnel={openFunnelCreateForm}
      />

      {/* Slide-over Formulário de Produto (abre da direita para a esquerda com animação) */}
      {/* Overlay com transição */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isFormOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsFormOpen(false)}
      />
      {/* Painel à direita com animação de slide (Produto) */}
      <ProductForm
        open={isFormOpen}
        mode={formMode}
        name={formName}
        description={formDescription}
        saving={saving}
        onChange={(f) => {
          if (f.name !== undefined) setFormName(f.name);
          if (f.description !== undefined) setFormDescription(f.description);
        }}
        onSave={handleSaveProduct}
        onClose={() => setIsFormOpen(false)}
      />

      {/* Painel de Inboxes e WhatsApp (condicional, abre da direita) */}
      <InboxPanel
        open={isInboxPanelOpen}
        inboxes={inboxes}
        loading={inboxesLoading}
        syncingInstance={syncingInstance}
        connectionSuccess={connectionSuccess}
        connectInfo={connectInfo}
        connectMethod={connectMethod}
        onClose={() => setIsInboxPanelOpen(false)}
        onSyncInstance={syncInboxInstance}
      />

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
