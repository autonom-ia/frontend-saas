# Interface de Conversas - Chatwoot Style

Esta é uma interface de gerenciamento de conversas inspirada no Chatwoot, construída para validação de layout antes da integração com a API.

## Estrutura de Componentes

```
conversations/
├── page.tsx                          # Página principal (3 colunas)
├── mock-data.ts                      # Dados mockados para testes
├── components/
│   ├── ConversationsList.tsx        # Lista de conversas (coluna esquerda)
│   ├── ConversationListItem.tsx     # Item individual da lista
│   ├── MessagesView.tsx             # Visualização de mensagens (coluna central)
│   ├── MessageBubble.tsx            # Bubble individual de mensagem
│   ├── ContactSidebar.tsx           # Sidebar de informações do contato (direita)
│   └── TypingIndicator.tsx          # Indicador de digitação
```

## Layout (3 Colunas)

### 1. Lista de Conversas (Esquerda - 320px)
- **Header**: Título + Campo de busca
- **Filtros**: Todas / Minhas / Não atribuídas / Filtro avançado
- **Lista**: Conversas com:
  - Avatar do contato
  - Nome e última mensagem
  - Timestamp relativo (5m, 2h, 3d)
  - Badge de não lidas
  - Indicador de status (open, resolved, pending, snoozed)
  - Ícone do canal (WhatsApp, Web, Email, Instagram)
  - Agente responsável

### 2. Visualização de Mensagens (Centro - Flexível)
- **Header**: 
  - Avatar e nome do contato
  - Canal e status
  - Ações: Ligar, Vídeo, Menu
- **Área de Mensagens**:
  - Scroll automático para última mensagem
  - Bubbles diferenciados (incoming/outgoing)
  - Timestamps
  - Avatares dos remetentes
- **Input de Mensagem**:
  - Textarea com auto-resize
  - Botões: Anexar, Emoji, Enviar
  - Atalhos: Enter (enviar), Shift+Enter (nova linha)

### 3. Sidebar de Contato (Direita - 320px)
- **Perfil**: Avatar grande + nome + data de cadastro
- **Acordeões**:
  - Detalhes do Contato (email, phone, última atividade, total conversas)
  - Atributos Personalizados (company, city, source, etc)
  - Ações da Conversa (resolver, transferir, etiquetar, silenciar)
  - Conversas Anteriores (histórico)
- **Botão de fechar** (minimiza sidebar)

## Recursos Implementados

✅ **Layout responsivo** de 3 colunas
✅ **Animações de entrada** (fade + translate)
✅ **Estados visuais** (hover, active, focus)
✅ **Indicadores de status** (cores por tipo)
✅ **Timestamps relativos** (agora, 5m, 2h, 3d)
✅ **Scroll automático** para nova mensagem
✅ **Textarea com auto-resize**
✅ **Acordeões** na sidebar
✅ **Badges de não lidas**
✅ **Ícones de canal**
✅ **Avatares** com fallback
✅ **Dark mode** (tema do projeto)

## Próximos Passos (Integração API)

1. **Substituir mock-data.ts** por chamadas reais à API Chatwoot
2. **WebSocket** para mensagens em tempo real
3. **Infinite scroll** na lista de conversas
4. **Upload de arquivos** (attachments)
5. **Emoji picker**
6. **Typing indicators** (real-time)
7. **Canned responses** (respostas prontas)
8. **Filtros avançados** (por etiqueta, período, etc)
9. **Busca global** de conversas e mensagens
10. **Notificações** de novas mensagens

## Como Testar

1. Acesse `/conversations` no navegador
2. Clique em diferentes conversas para alternar
3. Digite mensagens no input (Enter para enviar)
4. Teste fechar/abrir a sidebar de contato
5. Valide responsividade e animações

## Dados Mock

Atualmente usando 5 conversas mock e 8 mensagens de exemplo para a conversa #2 (Ana Paula).

Para adicionar mais dados de teste, edite `mock-data.ts`.

## Integração Futura

Quando conectar à API Chatwoot, os endpoints principais serão:

- `GET /api/v1/accounts/{accountId}/conversations` - Listar conversas
- `GET /api/v1/accounts/{accountId}/conversations/{id}/messages` - Mensagens
- `POST /api/v1/accounts/{accountId}/conversations/{id}/messages` - Enviar mensagem
- WebSocket via ActionCable para real-time

Consulte a documentação da API fornecida anteriormente.
