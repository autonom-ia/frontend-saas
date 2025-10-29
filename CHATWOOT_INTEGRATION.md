# Integração Chatwoot - Documentação

## 📋 Visão Geral

A integração com o Chatwoot permite visualizar e interagir com conversas em tempo real diretamente no kanban da plataforma Autonom.ia.

## 🔐 Autenticação

### Credenciais Utilizadas

A integração usa **autenticação via API Token** para evitar problemas de CORS.

- **URL do Chatwoot**: Parâmetro `chatwoot-url` da conta (`account_parameter`)
- **API Token**: Parâmetro `chatwoot-token` da conta (`account_parameter`)
- **Account ID**: Parâmetro `chatwoot-account` da conta (`account_parameter`)

### Exemplo
```javascript
// Parâmetros da conta
chatwootUrl: "https://chat-empresta.autonomia.site"
chatwootToken: "abc123xyz..."
chatwootAccountId: "456"
```

### Fluxo de Autenticação

1. Drawer abre quando usuário clica no ícone de mensagem do card
2. `ChatwootService.initialize()` é chamado com URL, token e accountId
3. Token é armazenado no serviço e usado no header `api_access_token`
4. Todas as requisições usam o token para autenticação

## 🏗️ Arquitetura

### Arquivos Principais

```
frontend/
├── src/
│   ├── services/
│   │   └── chatwoot.ts              # Serviço singleton para API Chatwoot
│   └── app/kanban/
│       ├── components/
│       │   └── ConversationDrawer.tsx  # Drawer com integração
│       └── page.tsx                 # Kanban page
```

### ChatwootService (`/src/services/chatwoot.ts`)

Serviço singleton que gerencia:
- ✅ Autenticação via `/auth/sign_in`
- ✅ Obtenção de conversas
- ✅ Carregamento de mensagens
- ✅ Envio de mensagens
- ✅ Atualização de status
- ✅ Busca de contatos

#### Métodos Principais

```typescript
// Inicializar serviço
await chatwootService.initialize(
  chatwootUrl: string,
  apiToken: string,
  chatwootAccountId: string
);

// Buscar conversa específica
const conversation = await chatwootService.getConversation(conversationId);

// Buscar mensagens
const messages = await chatwootService.getMessages(conversationId);

// Enviar mensagem
const newMessage = await chatwootService.sendMessage(
  conversationId,
  content: string,
  messageType: 'outgoing' | 'incoming',
  isPrivate: boolean
);

// Atualizar status
await chatwootService.updateConversationStatus(
  conversationId,
  status: 'open' | 'resolved' | 'pending'
);
```

## 🔄 Fluxo de Integração

### 1. Usuário Clica no Ícone de Mensagem

```typescript
// No card do kanban
<button onClick={() => openConversation(item)}>
  <MessageCircle className="w-4 h-4" />
</button>
```

### 2. Drawer Abre e Inicializa

```typescript
const openConversation = (item: KanbanItem) => {
  setSelectedConversationItem(item);
  setConversationDrawerOpen(true);
};
```

### 3. useEffect Carrega Dados

```typescript
useEffect(() => {
  // 1. Inicializar Chatwoot com API token
  await chatwootService.initialize(chatwootUrl, chatwootToken, chatwootAccountId);
  
  // 2. Carregar conversa
  const conv = await chatwootService.getConversation(conversationId);
  
  // 3. Carregar mensagens
  const msgs = await chatwootService.getMessages(conversationId);
  
  setConversation(conv);
  setMessages(msgs);
}, [isOpen, conversationId, chatwootToken, chatwootAccountId]);
```

### 4. Usuário Envia Mensagem

```typescript
const handleSend = async () => {
  const newMessage = await chatwootService.sendMessage(
    conversationId,
    messageInput,
    'outgoing'
  );
  
  setMessages(prev => [...prev, newMessage]);
};
```

## 📊 Estrutura de Dados

### KanbanItem (do backend)

```typescript
{
  id: string | number,
  title: string,
  contact_name: string,
  user_session_conversation_id: number,  // ID da conversa no Chatwoot
  user_session_inbox_id: number,         // ID da inbox no Chatwoot
  // ... outros campos
}
```

### ChatwootConversation

```typescript
{
  id: number,
  account_id: number,
  inbox_id: number,
  status: 'open' | 'resolved' | 'pending',
  unread_count: number,
  created_at: number,
  updated_at: number,
  meta: {
    sender: {
      id: number,
      name: string,
      email?: string,
      phone_number?: string,
      thumbnail?: string,
      custom_attributes?: Record<string, unknown>
    },
    channel: 'Channel::WhatsApp' | 'Channel::WebWidget' | 'Channel::Email',
    assignee?: {
      id: number,
      name: string,
      email: string,
      avatar_url?: string
    }
  },
  messages?: ChatwootMessage[]
}
```

### ChatwootMessage

```typescript
{
  id: number,
  content: string,
  message_type: 0 | 1 | 2,  // 0=incoming, 1=outgoing, 2=activity
  created_at: number,        // Unix timestamp
  conversation_id: number,
  sender: {
    id: number,
    name: string,
    email?: string,
    avatar_url?: string,
    type: string
  },
  attachments?: Array<{
    id: number,
    file_type: string,
    data_url: string
  }>,
  private: boolean,
  status?: string
}
```

## 🎨 Interface do Drawer

### Layout

```
┌────────────────────────────────────────────────────────┐
│ [Avatar] Nome do Cliente          [Users][Phone][X]    │ Header
├────────────────────────────────────────────────────────┤
│                                                         │
│  [Avatar] Mensagem recebida               Mensagens    │
│           12:30                                         │
│                                                         │
│                        Mensagem enviada [Avatar]        │
│                                    12:31                │
│                                                         │
├────────────────────────────────────────────────────────┤
│ [📎] [_____Digite sua mensagem_____] [😊] [Enviar]     │ Input
└────────────────────────────────────────────────────────┘
```

### Estados

- **Loading**: Spinner centralizado
- **Error**: Mensagem de erro com botão "Fechar"
- **Empty**: "Nenhuma mensagem nesta conversa"
- **Loaded**: Lista de mensagens com scroll

### Cores

- Fundo: `bg-neutral-950` / `bg-neutral-900`
- Mensagens enviadas: `bg-blue-600`
- Mensagens recebidas: `bg-neutral-800`
- Borders: `border-neutral-800`
- Texto: `text-white` / `text-neutral-100`

## 🔧 Configuração Necessária

### 1. Account Parameters

Certifique-se que a conta tem os parâmetros:

```sql
-- Parâmetro com URL do Chatwoot
INSERT INTO account_parameter (account_id, name, value)
VALUES (123, 'chatwoot-url', 'https://chat-empresta.autonomia.site');

-- Parâmetro com account_id do Chatwoot
INSERT INTO account_parameter (account_id, name, value)
VALUES (123, 'chatwoot-account', '456');

-- Parâmetro com API token do Chatwoot
INSERT INTO account_parameter (account_id, name, value)
VALUES (123, 'chatwoot-token', 'abc123xyz...');
```

### 2. Como Obter o API Token do Chatwoot

1. Faça login no Chatwoot como administrador
2. Vá em **Settings** → **Applications** → **API Access Tokens**
3. Clique em **Add Access Token**
4. Dê um nome descritivo (ex: "Autonom.ia Integration")
5. Copie o token gerado
6. Salve no `account_parameter` com nome `chatwoot-token`

**Importante**: O token deve ter permissão de `agent` ou `administrator` para acessar conversas.

### 3. KanbanItem com Conversation ID

Os items do kanban devem ter:

```javascript
{
  user_session_conversation_id: 789,  // ID da conversa no Chatwoot
  user_session_inbox_id: 456          // ID da inbox no Chatwoot
}
```

## 🧪 Testes

### Teste Local

```bash
cd /Users/robertomartins/Workspace/autonom.ia/frontend
npm run dev
```

1. Acesse `/kanban`
2. Selecione produto e conta
3. Clique no ícone de mensagem (💬) em um card
4. Drawer abre
5. Verifique console: logs de inicialização, carregamento e envio
6. Digite mensagem e envie

### Logs Esperados

```
[ConversationDrawer] Initializing Chatwoot...
[ChatwootService] Initialized: { accountId: '456' }
[ConversationDrawer] Loading conversation: 789
[ConversationDrawer] Loaded 15 messages
[ConversationDrawer] Sending message: Olá!
```

## ⚠️ Tratamento de Erros

### Cenários Tratados

1. **Falha na autenticação**: Mostra erro "Falha na autenticação Chatwoot: 401"
2. **Conversa não encontrada**: Mostra erro "Falha ao buscar conversa: 404"
3. **Erro ao enviar mensagem**: Restaura input e mostra erro
4. **Dados faltando**: Valida presença de URL, email, domain, conversationId

### Feedback Visual

- Spinner durante loading
- Botão desabilitado durante envio
- Mensagem de erro em vermelho
- Botão "Fechar" em caso de erro fatal

## 🚀 Próximos Passos

### Funcionalidades Futuras

1. **WebSocket**: Mensagens em tempo real sem reload
2. **Upload de arquivos**: Anexar imagens/documentos
3. **Emoji Picker**: Seletor de emojis funcional
4. **Typing Indicator**: Mostrar quando agente está digitando
5. **Respostas Prontas**: Canned responses
6. **Transferência**: Transferir conversa para outro agente
7. **Resolver Conversa**: Botão funcional para resolver
8. **Histórico**: Visualizar conversas antigas
9. **Busca**: Buscar em mensagens
10. **Notificações**: Notificar novas mensagens

## 📝 Notas Importantes

- ✅ **Autenticação via API Token** - evita problemas de CORS
- ⚠️ Token é **carregado dos parâmetros** da conta a cada abertura do drawer
- ⚠️ **Não há auto-refresh** de mensagens - usuário precisa reabrir drawer
- ✅ Serviço é **singleton** - uma única instância compartilhada
- ✅ Drawer é **responsivo** - 75vw com sidebar, 60vw sem
- ✅ **Estados de loading** bem definidos para melhor UX
- ✅ **Sem problemas de CORS** - token é enviado via header, não via cookie

## 🔍 Debug

### Verificar no Console

```javascript
// Verificar se serviço está inicializado
chatwootService.isInitialized(); // true/false

// Limpar autenticação (útil para testes)
chatwootService.clear();
```

### Verificar Network Tab

1. Abra DevTools → Network
2. Filtre por `/api/v1/`
3. Veja requisições:
   - `POST /auth/sign_in` → Login
   - `GET /conversations/:id` → Carregar conversa
   - `GET /conversations/:id/messages` → Carregar mensagens
   - `POST /conversations/:id/messages` → Enviar mensagem

---

**Última Atualização**: 29/10/2025  
**Versão**: 1.0.0 - Integração Inicial
