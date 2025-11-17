# Sistema de Temas Dinâmicos por Subdomínio

## 📋 Visão Geral

Sistema que permite personalizar cores, logo e estilos da aplicação baseado no subdomínio acessado.

**Exemplos:**
- `autonomia.site` → Tema padrão (escuro)
- `hub2you.autonomia.site` → Tema Hub2You (claro)
- `localhost` → Tema padrão

---

## 🗂️ Estrutura de Arquivos

```
src/
├── config/
│   └── themes/
│       ├── index.ts          # Mapeamento de temas
│       ├── default.ts         # Tema padrão (Autonomia)
│       └── hub2you.ts         # Tema Hub2You
├── contexts/
│   └── ThemeContext.tsx       # Provider de tema
├── hooks/
│   └── useTheme.ts            # Hook para usar tema
└── components/
    └── ThemeExample.tsx       # Exemplo de uso
```

---

## 🚀 Como Usar

### **1. Envolver aplicação com ThemeProvider**

Em `src/app/layout.tsx` ou `src/app/providers/index.tsx`:

```tsx
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### **2. Usar tema em componentes**

```tsx
"use client";

import { useTheme } from '@/contexts/ThemeContext';
import Image from 'next/image';

export default function MyComponent() {
  const { theme, subdomain } = useTheme();

  return (
    <div className={theme.colors.background.primary}>
      {/* Logo dinâmico */}
      <Image src={theme.logo} alt="Logo" width={150} height={150} />
      
      {/* Texto com cor do tema */}
      <h1 className={theme.colors.text.primary}>
        Bem-vindo!
      </h1>
      
      {/* Botão com cor do tema */}
      <button className={theme.colors.button.primary}>
        Clique aqui
      </button>
      
      {/* Card de alerta */}
      <div className={`p-4 rounded border ${theme.colors.accent.primary}`}>
        Informação importante
      </div>
    </div>
  );
}
```

---

## 🎨 Propriedades do Tema

### **theme.name**
Nome do tema (string)

### **theme.logo**
Caminho para o logo (string)

### **theme.colors**

#### **background**
- `primary` - Background principal
- `secondary` - Background secundário
- `card` - Background de cards
- `hover` - Estado hover

#### **text**
- `primary` - Texto principal
- `secondary` - Texto secundário
- `muted` - Texto suavizado
- `accent` - Texto de destaque

#### **border**
- `primary` - Borda principal
- `secondary` - Borda secundária
- `accent` - Borda de destaque

#### **button**
- `primary` - Botão primário
- `secondary` - Botão secundário
- `ghost` - Botão ghost
- `outline` - Botão outline

#### **accent**
- `primary` - Acento informativo
- `success` - Acento de sucesso
- `warning` - Acento de aviso
- `error` - Acento de erro

### **theme.cssVariables**
Variáveis CSS aplicadas ao `:root` (usado por shadcn/ui)

---

## ➕ Adicionar Novo Tema

### **1. Criar arquivo do tema**

`src/config/themes/cliente.ts`:

```typescript
import { Theme } from './default';

export const clienteTheme: Theme = {
  name: 'cliente',
  logo: '/images/logos/cliente-logo.png',
  colors: {
    background: {
      primary: 'bg-gradient-to-br from-purple-50 via-white to-purple-50',
      secondary: 'bg-white',
      card: 'bg-white/80',
      hover: 'hover:bg-purple-50',
    },
    text: {
      primary: 'text-gray-900',
      secondary: 'text-gray-700',
      muted: 'text-gray-500',
      accent: 'text-purple-600',
    },
    // ... demais cores
  },
  cssVariables: {
    '--primary': '271.5 81.3% 55.9%', // Purple
    // ... demais variáveis
  },
};
```

### **2. Registrar tema no mapeamento**

Em `src/config/themes/index.ts`:

```typescript
import { clienteTheme } from './cliente';

const themeMap: Record<string, Theme> = {
  'hub2you': hub2youTheme,
  'cliente': clienteTheme,  // ← Adicionar aqui
  'default': defaultTheme,
};
```

### **3. Adicionar logo**

Colocar arquivo em:
```
public/images/logos/cliente-logo.png
```

---

## 🎨 Temas Disponíveis

### **Default (Autonomia)**
- **Subdomínio:** Nenhum ou não mapeado
- **Estilo:** Tema escuro com azul
- **Logo:** `/images/logo.png`

### **Hub2You**
- **Subdomínio:** `hub2you.autonomia.site`
- **Estilo:** Tema claro com azul
- **Logo:** `/images/logos/hub2you-logo.png`

---

## 🧪 Testar Localmente

### **Método 1: Editar /etc/hosts**

Adicionar em `/etc/hosts`:
```
127.0.0.1 hub2you.localhost
127.0.0.1 cliente.localhost
```

Acessar:
- `http://localhost:3000` → Tema padrão
- `http://hub2you.localhost:3000` → Tema Hub2You
- `http://cliente.localhost:3000` → Tema Cliente

### **Método 2: Forçar subdomínio no código**

Para testar temporariamente, modificar `src/config/themes/index.ts`:

```typescript
export function getSubdomain(): string | null {
  // Forçar tema para teste
  return 'hub2you'; // ou 'cliente'
  
  // ... código original comentado
}
```

⚠️ **Lembrar de reverter após testes!**

---

## 📦 Deploy

### **1. Configurar DNS**

Adicionar registros CNAME:
```
hub2you.autonomia.site → autonomia.site
cliente.autonomia.site → autonomia.site
```

### **2. Adicionar logos**

Fazer upload dos logos para:
```
public/images/logos/hub2you-logo.png
public/images/logos/cliente-logo.png
```

### **3. Build e deploy**

```bash
npm run build
# Deploy para servidor/Vercel/Amplify
```

---

## 🔍 Debugging

### **Ver tema ativo**

Abrir console do navegador:
```
[ThemeProvider] Subdomain: hub2you
[ThemeProvider] Theme loaded: hub2you
```

### **Verificar CSS Variables**

No DevTools, inspecionar `:root`:
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  /* ... */
}
```

---

## 💡 Boas Práticas

### **1. Sempre usar classes do tema**

❌ **Evitar:**
```tsx
<div className="bg-gray-900 text-white">
```

✅ **Preferir:**
```tsx
<div className={theme.colors.background.primary}>
  <span className={theme.colors.text.primary}>
```

### **2. Fallback para logo**

```tsx
<Image 
  src={theme.logo} 
  alt="Logo"
  onError={(e) => {
    e.currentTarget.src = '/images/logo.png';
  }}
/>
```

### **3. Componente ThemeSafe**

Criar wrapper para componentes que precisam de tema:

```tsx
"use client";

import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeSafe({ children }) {
  const { theme } = useTheme();
  
  return <div data-theme={theme.name}>{children}</div>;
}
```

---

## 📝 Exemplo Completo

Ver arquivo: `src/components/ThemeExample.tsx`

Acessar rota para visualizar:
```
/theme-example
```

---

## 🐛 Troubleshooting

### **Tema não muda**

1. Verificar console para mensagens de debug
2. Conferir se `ThemeProvider` está envolvendo a aplicação
3. Limpar cache: `rm -rf .next && npm run dev`

### **Logo não aparece**

1. Verificar se arquivo existe em `public/images/logos/`
2. Usar caminho absoluto: `/images/logos/logo.png`
3. Verificar permissões do arquivo

### **Cores não aplicam**

1. Verificar se está usando classes Tailwind corretas
2. Rebuild: `npm run build`
3. Verificar se shadcn/ui está lendo CSS variables

---

## 🎯 Roadmap

- [ ] Adicionar suporte a tema dark/light toggle
- [ ] Permitir override de tema via localStorage
- [ ] Criar gerador de temas online
- [ ] Adicionar mais variações de cor (success, warning, etc)
- [ ] Suporte a fontes customizadas por tema

---

**Criado em:** 17/11/2025  
**Versão:** 1.0.0
