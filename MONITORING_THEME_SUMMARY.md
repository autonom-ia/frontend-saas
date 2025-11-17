# Resumo de Alterações - Tema Dinâmico em Monitoring

## ✅ Alterações Já Aplicadas:

### 1. Header
- ✅ Importado `useTheme`
- ✅ Background do header: `theme.colors.background.secondary`
- ✅ Border do header: `theme.colors.border.primary`
- ✅ Logo dinâmico: `theme.logo`
- ✅ Textos do header: `theme.colors.text.primary`
- ✅ Botões: `theme.colors.button.primary` e `secondary`
- ✅ Loading screen: `theme.colors.background.primary` e `theme.colors.text.muted`

### 2. Tabs
- ✅ Border: `theme.colors.border.primary`
- ✅ Tab ativa: `theme.colors.text.primary`
- ✅ Tab inativa: `theme.colors.text.muted`

## 📝 Alterações Pendentes (Principais):

### 3. Cards KPI
**Manter cores dinâmicas (azul/cinza/vermelho) mas aplicar tema no fundo:**
- Cards usam: `bg-gray-800/60` → trocar por `theme.colors.background.card`
- Borders: `border-gray-700` → `theme.colors.border.primary`

### 4. Gráficos
- Fundo dos gráficos: `bg-gray-900/60` → `theme.colors.background.card`
- Border: `border-gray-700` → `theme.colors.border.primary`
- Labels: `text-gray-300` → `theme.colors.text.secondary`

### 5. Tabelas
- Headers: `bg-gray-800 text-gray-300` → `${theme.colors.background.secondary} ${theme.colors.text.primary}`
- Linhas pares: `even:bg-gray-800` → aplicar tema
- Linhas ímpares: `odd:bg-gray-900` → aplicar tema
- Borders: `border-gray-700` → `theme.colors.border.primary`

### 6. Slide Panel
- Background: `bg-gray-900/95` → `theme.colors.background.card`
- Border: `border-gray-700` → `theme.colors.border.primary`
- Textos: aplicar `theme.colors.text.*`

## 🎨 Padrões de Cores Mantidos:

**IMPORTANTE:** Manter as cores dinâmicas dos indicadores:
- Total de Conversas: **Sempre azul** (bg-blue-900/20, text-blue-400)
- Não atribuídas: **Dinâmico** (gray/blue/red baseado no valor)
- Sem iteração: **Dinâmico** (gray/blue/red baseado no valor)

Estas cores têm significado visual importante e não devem usar o tema genérico.

## 📊 Resultado Esperado:

**Tema Hub2You (claro):**
- Fundo: Branco/Azul claro
- Textos: Cinza escuro/Preto
- Cards: Fundo branco com bordas cinza claras
- Indicadores mantém cores (azul/vermelho/verde)

**Tema Autonomia (escuro):**
- Fundo: Cinza escuro
- Textos: Brancos/Cinzas claros
- Cards: Fundo cinza escuro
- Indicadores mantém cores (azul/vermelho/verde)
