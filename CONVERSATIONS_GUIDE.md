# Guia de Validação - Interface de Conversas

## 🎯 Objetivo

Interface de gerenciamento de conversas estilo Chatwoot para validação de layout antes da integração com a API.

## 🚀 Como Testar

1. **Iniciar o servidor de desenvolvimento**
```bash
cd /Users/robertomartins/Workspace/autonom.ia/frontend
npm run dev
```

2. **Acessar a página**
```
http://localhost:3000/conversations
```

## ✅ Checklist de Validação

### Layout Geral
- [ ] Header fixo com logo e título "Conversas"
- [ ] 3 colunas: Lista (320px) + Mensagens (flex) + Sidebar (320px)
- [ ] Sidebar lateral esquerda com menu
- [ ] Animações de entrada (fade + translate)
- [ ] Responsividade (sidebar de contato pode ser fechada)

### Lista de Conversas (Coluna Esquerda)
- [ ] Campo de busca funcional
- [ ] Filtros: Todas / Minhas / Não atribuídas
- [ ] 5 conversas mockadas visíveis
- [ ] Cada item mostra:
  - [ ] Avatar do contato
  - [ ] Nome e última mensagem
  - [ ] Timestamp relativo (5m, 2h, etc)
  - [ ] Badge de mensagens não lidas
  - [ ] Indicador de status (bolinha colorida)
  - [ ] Ícone do canal (WhatsApp, Web, Email, Instagram)
  - [ ] Nome do agente responsável
- [ ] Hover effect nos itens
- [ ] Item ativo destacado com borda azul
- [ ] Clique alterna entre conversas

### Visualização de Mensagens (Coluna Central)
- [ ] Header da conversa com:
  - [ ] Avatar e nome do contato
  - [ ] Canal e status
  - [ ] Botões de ação (Ligar, Vídeo, Menu)
- [ ] 8 mensagens mockadas visíveis
- [ ] Bubbles diferenciados:
  - [ ] Mensagens recebidas: à esquerda, fundo cinza
  - [ ] Mensagens enviadas: à direita, fundo azul
- [ ] Avatar do remetente em cada mensagem
- [ ] Timestamps formatados (HH:mm)
- [ ] Scroll automático para última mensagem
- [ ] Área de input de mensagem com:
  - [ ] Botão de anexar arquivo
  - [ ] Textarea expansível
  - [ ] Botão de emoji
  - [ ] Botão de enviar
  - [ ] Placeholder informativo
- [ ] Enter envia mensagem (simulado no console)
- [ ] Shift+Enter adiciona nova linha

### Sidebar de Contato (Coluna Direita)
- [ ] Botão de fechar (X)
- [ ] Avatar grande do contato
- [ ] Nome e data de cadastro
- [ ] Seções em acordeão:
  - [ ] **Detalhes do Contato**: Email, Telefone, Última atividade, Total de conversas
  - [ ] **Atributos Personalizados**: Company, City, Source
  - [ ] **Ações da Conversa**: 4 botões de ação
  - [ ] **Conversas Anteriores**: Link para histórico
- [ ] Acordeões abrem/fecham com animação
- [ ] Ícones contextuais em cada campo

### Estados e Interações
- [ ] Empty state quando nenhuma conversa está selecionada
- [ ] Botão flutuante de "Mostrar contato" quando sidebar está fechada
- [ ] Transições suaves entre conversas
- [ ] Dark mode aplicado em todos componentes
- [ ] Cores do tema respeitadas (primary, secondary, muted, etc)

## 🎨 Validação Visual

### Cores e Contraste
- **Background**: `hsl(222.2 84% 4.9%)` - Preto azulado
- **Primary**: `hsl(210 100% 56%)` - Azul (#47B5FF)
- **Secondary**: `hsl(217.2 32.6% 17.5%)` - Cinza escuro
- **Foreground**: `hsl(210 40% 98%)` - Branco off-white
- **Muted**: Cinza médio para textos secundários

### Status Colors
- **Open**: Verde (`bg-green-500`)
- **Resolved**: Cinza (`bg-gray-500`)
- **Pending**: Amarelo (`bg-yellow-500`)
- **Snoozed**: Azul (`bg-blue-500`)

### Tipografia
- **Títulos**: font-semibold, text-lg ou text-xl
- **Corpo**: text-sm, text-foreground
- **Secundário**: text-xs, text-muted-foreground
- **Timestamps**: text-xs

## 🧪 Testes de Interação

1. **Trocar de Conversa**
   - Clique em "João Silva" → Deve mostrar empty (sem mensagens mock)
   - Clique em "Ana Paula" → Deve mostrar 8 mensagens
   - Verifique se o scroll vai para o final automaticamente

2. **Enviar Mensagem**
   - Digite "Teste" no input
   - Pressione Enter
   - Verifique console: `Enviando mensagem: Teste`
   - Input deve limpar após envio

3. **Fechar/Abrir Sidebar**
   - Clique no X da sidebar de contato
   - Botão flutuante deve aparecer no canto inferior direito
   - Clique no botão → Sidebar reabre

4. **Responsividade**
   - Redimensione a janela
   - Verifique se o layout se adapta
   - Mensagens devem quebrar linha corretamente

## 📊 Dados Mock

### Conversas Disponíveis
1. **João Silva** - Resolved, WhatsApp, Maria Santos
2. **Ana Paula** - Open, Web, Você (3 não lidas) ⭐ *Tem mensagens*
3. **Carlos Oliveira** - Open, Email, Não atribuído (1 não lida)
4. **Fernanda Costa** - Pending, Instagram, Pedro Alves
5. **Roberto Martins** - Resolved, WhatsApp, Você

### Mensagens (Ana Paula)
8 mensagens de exemplo simulando um atendimento completo de suporte sobre rastreamento de pedido.

## 🔧 Próximos Passos (Pós-validação)

Após validar o layout, os próximos passos incluem:

1. **Integração com API Chatwoot**
   - Substituir `mock-data.ts` por chamadas reais
   - Implementar `useChatwootConversation` hook
   - Conectar WebSocket para real-time

2. **Funcionalidades Avançadas**
   - Upload de arquivos (attachments)
   - Emoji picker
   - Typing indicators em tempo real
   - Infinite scroll na lista
   - Canned responses (respostas prontas)
   - Busca avançada

3. **Filtros e Ações**
   - Implementar filtros funcionais
   - Resolver/Reabrir conversa
   - Atribuir agente/equipe
   - Adicionar/remover etiquetas
   - Silenciar conversa

4. **Otimizações**
   - Virtual scrolling para listas grandes
   - Lazy loading de mensagens antigas
   - Cache de conversas
   - Debounce na busca

## 📝 Notas Importantes

- **Dados são mockados**: Nenhuma alteração é persistida
- **Console logs**: Mensagens enviadas aparecem no console do navegador
- **Performance**: Interface otimizada para até 100 conversas simultâneas
- **Acessibilidade**: Todos os elementos interativos têm hover/focus states

## 🐛 Troubleshooting

### Erro de compilação TypeScript
Certifique-se que todas as dependências estão instaladas:
```bash
npm install
```

### Imagens não carregam
Verifique se `/public/images/logo.png` existe no projeto.

### Layout quebrado
Limpe o cache do Next.js:
```bash
rm -rf .next
npm run dev
```

### Cores não aparecem
Verifique se o arquivo `tailwind.config.ts` tem as cores definidas corretamente.

## 📧 Feedback

Após validar, documente:
- ✅ O que funcionou bem
- ⚠️ O que precisa ajustar
- 💡 Sugestões de melhoria
- 🎨 Mudanças de design necessárias

---

**Data de Criação**: 29 de outubro de 2025  
**Versão**: 1.0.0 - Layout Mockado  
**Autor**: Windsurf AI Assistant
