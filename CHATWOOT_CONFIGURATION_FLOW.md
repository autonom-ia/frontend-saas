# Fluxo de Configuração do Chatwoot

## 📊 Fluxo Completo no Inbox Panel

### **1. Sync da Instância (CreateInstance)**
```typescript
const syncInboxInstance = async (instanceName: string) => {
  // POST /Autonomia/Evolution/CreateInstance
  body: { 
    account_id: inboxPanelAccount.id,  // ← ACCOUNT_ID AQUI
    instanceName: instanceName 
  }
  
  // Retorna: { base64, pairingCode }
  // Inicia polling
}
```

### **2. Polling (Detectar Conexão)**
```typescript
useEffect(() => {
  const interval = setInterval(async () => {
    const st = await fetchInboxStatus(accountId, instance);
    
    if (st === 'open') {
      setConnectionSuccess(true);
      setPolling(false);
      
      // ✅ CHAMADA AUTOMÁTICA DO SET-CHATWOOT
      if (!setChatwootCalledFor[instance]) {
        setSetChatwootCalledFor(prev => ({ ...prev, [instance]: true }));
        await callSetChatwoot(
          inboxPanelAccount.domain || '',  // domain
          instance,                        // instanceName
          inboxPanelAccount.id             // ← ACCOUNT_ID AQUI
        );
      }
    }
  }, 20000); // Poll a cada 20 segundos
}, [polling, connectInfo?.instance, inboxPanelAccount]);
```

### **3. Configurar Chatwoot**
```typescript
const callSetChatwoot = async (domain: string, instance: string, accountId: string) => {
  // Buscar parâmetros da conta
  const paramsMap = await fetchAccountParametersMap(accountId);
  const cwAccountId = paramsMap['chatwoot-account'] || '';
  const cwUrl = paramsMap['chatwoot-url'] || '';
  const cwToken = paramsMap['chatwoot-token'] || '';

  const body = {
    account_id: accountId,  // ← ACCOUNT_ID AQUI (será sobrescrito por cwAccountId se existir)
    enabled: true,
  };
  
  // Sobrescrever com parâmetros do Chatwoot se existirem
  if (cwAccountId) body.account_id = cwAccountId;
  if (cwUrl) body.url = cwUrl;
  if (cwToken) body.token = cwToken;

  // POST /Autonomia/Evolution/SetChatwoot/:instance?account_id=:accountId
  const resp = await fetch(
    `${apiUrl}/Autonomia/Evolution/SetChatwoot/${instance}?account_id=${accountId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(body)
    }
  );
};
```

---

## 🔑 Como o account_id é Passado

### **Fonte:**
```typescript
// settings/page.tsx
const [inboxPanelAccount, setInboxPanelAccount] = useState<Account | null>(null);

// Quando abre o painel de inbox
const openAccountInboxPanel = async (acc: Account) => {
  setInboxPanelAccount(acc);  // ← Armazena a conta selecionada
  // ...
};

// account_id vem de: inboxPanelAccount.id
```

### **Estrutura do Account:**
```typescript
type Account = {
  id: string;          // ← Este é o account_id
  name: string;
  email?: string;
  phone?: string;
  domain?: string;
  product_id?: string;
  conversation_funnel_id?: string;
};
```

---

## 🎯 Adaptação para o Onboarding

### **Contexto no Onboarding:**

No onboarding, você **já tem** o `accountId` retornado pelo endpoint de criação da conta:

```typescript
// StepConfigureAccount retorna:
{
  accountId: "uuid-conta-criada",
  accountName: "Noktua IO",
  accountPhone: "31982813234",
  ...
}
```

### **Fluxo Proposto:**

```typescript
// StepConnectWhatsApp.tsx

// 1. Criar instância (já implementado)
const handleReady = async () => {
  const resp = await fetch(`${apiUrl}/Autonomia/Evolution/CreateInstance`, {
    method: 'POST',
    body: JSON.stringify({
      account_id: accountId,      // ← Recebido via props
      instanceName: accountPhone,
      qrcode: true
    })
  });
  
  const data = await resp.json();
  setQrCodeBase64(data?.base64);
  setPairingCode(data?.pairingCode);
  
  startPolling(); // ← Inicia polling
};

// 2. Polling (já implementado)
const startPolling = () => {
  const interval = setInterval(async () => {
    const status = await checkConnectionStatus();
    
    if (status === 'open') {
      clearInterval(interval);
      setIsConnected(true);
      
      // ✅ ADICIONAR: Chamar configuração do Chatwoot
      await configChatwootAfterConnection();
      
      // Delay antes de avançar para o próximo step
      setTimeout(() => onNext(), 1500);
    }
  }, 2000);
};

// 3. NOVA FUNÇÃO: Configurar Chatwoot após conexão
const configChatwootAfterConnection = async () => {
  try {
    const token = getAuthToken();
    const apiUrl = process.env.NEXT_PUBLIC_EVOLUTION_API_URL || process.env.NEXT_PUBLIC_API_URL;
    
    // Buscar parâmetros da conta (opcional, pode pular se não tiver)
    let paramsMap: Record<string, string> = {};
    try {
      paramsMap = await fetchAccountParametersMap(accountId);
    } catch (err) {
      console.warn('Não foi possível buscar parâmetros da conta:', err);
    }
    
    const cwAccountId = paramsMap['chatwoot-account'] || '';
    const cwUrl = paramsMap['chatwoot-url'] || '';
    const cwToken = paramsMap['chatwoot-token'] || '';

    const body: Record<string, unknown> = {
      account_id: accountId,  // ← Usar o accountId do onboarding
      enabled: true,
    };
    
    // Sobrescrever com parâmetros se existirem
    if (cwAccountId) body.account_id = cwAccountId;
    if (cwUrl) body.url = cwUrl;
    if (cwToken) body.token = cwToken;

    const resp = await fetch(
      `${apiUrl}/Autonomia/Evolution/SetChatwoot/${accountPhone}?account_id=${accountId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        mode: 'cors',
        body: JSON.stringify(body)
      }
    );

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error('Erro ao configurar Chatwoot:', resp.status, errorText);
      // Não bloqueia o fluxo, apenas loga o erro
      return;
    }

    console.log('Chatwoot configurado com sucesso após conexão WhatsApp');
  } catch (err) {
    console.error('Erro ao configurar Chatwoot:', err);
    // Não bloqueia o fluxo
  }
};

// 4. Helper: Buscar parâmetros da conta (opcional)
const fetchAccountParametersMap = async (accountId: string): Promise<Record<string, string>> => {
  const token = getAuthToken();
  const saasApiUrl = process.env.NEXT_PUBLIC_SAAS_API_URL;
  
  const resp = await fetch(
    `${saasApiUrl}/Autonomia/Saas/AccountParameters?accountId=${accountId}`,
    {
      headers: { 'Authorization': `Bearer ${token}` },
      mode: 'cors'
    }
  );
  
  if (!resp.ok) return {};
  
  const json = await resp.json();
  const rows = Array.isArray(json?.data) ? json.data : [];
  
  const map: Record<string, string> = {};
  for (const row of rows) {
    if (row.name && row.value) {
      map[row.name] = String(row.value);
    }
  }
  
  return map;
};
```

---

## 📝 Resumo das Alterações Necessárias

### **1. StepConnectWhatsApp.tsx**

- ✅ Já tem: `accountId` e `accountPhone` via props
- ✅ Já tem: Polling de conexão
- ⏳ **Adicionar:** Chamada ao `SetChatwoot` quando detectar `status === 'open'`

### **2. Parâmetros Necessários**

**Obrigatórios:**
- `account_id` - Já tem via props
- `instanceName` - Já tem (accountPhone)

**Opcionais (do account_parameter):**
- `chatwoot-account` - Sobrescreve account_id no body
- `chatwoot-url` - URL do Chatwoot
- `chatwoot-token` - Token do Chatwoot

### **3. Endpoint Backend**

```
POST /Autonomia/Evolution/SetChatwoot/:instanceName?account_id=:accountId

Body:
{
  "account_id": "uuid-chatwoot-account",  // Pode ser diferente do accountId da query
  "enabled": true,
  "url": "https://chatwoot.autonomia.site",  // Opcional
  "token": "token-chatwoot"                  // Opcional
}
```

---

## 🔄 Fluxo Visual Completo

```
Usuário clica "Tudo Pronto"
  ↓
POST /CreateInstance (account_id, instanceName)
  ↓
Recebe QR Code / Pairing Code
  ↓
Exibe na tela
  ↓
Inicia Polling (a cada 2s)
  ↓
GET /ConnectionState?account_id=xxx&instance=yyy
  ↓
Status === 'open' ?
  ↓ SIM
✅ POST /SetChatwoot/:instance?account_id=xxx
  ↓
Aguarda 1.5s
  ↓
onNext() → Step 4 (Sucesso)
```

---

## ⚠️ Pontos de Atenção

### **1. account_id vs chatwoot-account**

- **Query param `account_id`:** ID da conta no banco principal (SAAS)
- **Body `account_id`:** ID da conta no Chatwoot (pode ser diferente)

**Exemplo:**
```
Query: ?account_id=uuid-saas-123
Body: { account_id: "5" }  ← ID da conta no Chatwoot
```

### **2. Tratamento de Erro**

- ✅ **Não bloquear o fluxo** se SetChatwoot falhar
- ✅ **Logar o erro** para debug
- ✅ **Permitir avançar** para o próximo step mesmo com falha

### **3. Parâmetros Opcionais**

Se a conta não tiver os parâmetros `chatwoot-account`, `chatwoot-url`, `chatwoot-token`:
- Backend pode usar valores padrão do `product_parameter` (fallback implementado)
- Ou retornar erro se forem obrigatórios

---

## 📁 Arquivos Envolvidos

### **Frontend:**
- ✅ `app/settings/page.tsx` - Implementação de referência
- ⏳ `components/onboarding/StepConnectWhatsApp.tsx` - Implementar

### **Backend:**
- ✅ `api/evolution/handlers/set-chatwoot.js` - Endpoint
- ✅ `api/evolution/services/evolution-service.js` - Lógica de configuração

---

## ✅ Checklist de Implementação

- [ ] Adicionar função `configChatwootAfterConnection` no StepConnectWhatsApp
- [ ] Adicionar função `fetchAccountParametersMap` (helper)
- [ ] Chamar `configChatwootAfterConnection` no polling quando `status === 'open'`
- [ ] Testar com conta que tem parâmetros Chatwoot
- [ ] Testar com conta sem parâmetros (fallback para product)
- [ ] Verificar logs no backend
- [ ] Confirmar que não bloqueia o fluxo em caso de erro

---

## 🎯 Resultado Esperado

Após conectar o WhatsApp no onboarding:
1. ✅ Instância criada
2. ✅ WhatsApp conectado
3. ✅ Chatwoot configurado automaticamente
4. ✅ Usuário avança para Step 4 (Sucesso)
5. ✅ Tudo pronto para uso! 🚀
