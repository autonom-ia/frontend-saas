# Sistema de Temas Dinâmicos - Resumo Executivo

## ✅ Implementação Completa

Sistema que altera automaticamente cores, logo e estilos baseado no subdomínio acessado.

---

## 🎯 Funcionalidades

### **Detecção Automática**
- `autonomia.site` → Tema padrão (escuro)
- `hub2you.autonomia.site` → Tema Hub2You (claro)
- `localhost` → Tema padrão

### **Personalização Completa**
- ✅ Logo dinâmico
- ✅ Cores de background
- ✅ Cores de texto
- ✅ Cores de bordas
- ✅ Cores de botões
- ✅ Cores de alerta
- ✅ CSS Variables (shadcn/ui)

---

## 📁 Arquivos Criados

### **1. Configuração de Temas**
```
src/config/themes/
├── index.ts          # Mapeamento e detecção de subdomínio
├── default.ts        # Tema Autonomia (escuro)
└── hub2you.ts        # Tema Hub2You (claro)
```

### **2. Context & Hook**
```
src/contexts/ThemeContext.tsx    # Provider React
src/hooks/useTheme.ts             # Hook (alternativa)
```

### **3. Exemplos**
```
src/components/ThemeExample.tsx   # Componente exemplo
src/app/theme-test/page.tsx       # Página de teste
```

### **4. Documentação**
```
THEMING_SYSTEM.md                 # Documentação completa
THEME_SYSTEM_README.md            # Este arquivo
```

---

## 🚀 Como Usar

### **1. Já está integrado!**

O `ThemeProvider` foi adicionado ao `layout.tsx`, então todas as páginas já têm acesso ao tema.

### **2. Em qualquer componente:**

```tsx
"use client";

import { useTheme } from '@/contexts/ThemeContext';

export default function MyComponent() {
  const { theme, subdomain } = useTheme();

  return (
    <div className={theme.colors.background.primary}>
      <h1 className={theme.colors.text.primary}>Título</h1>
      <button className={theme.colors.button.primary}>Botão</button>
    </div>
  );
}
```

---

## 🎨 Temas Disponíveis

### **Default (Autonomia)**
- **Cores:** Escuro (cinza/azul)
- **Logo:** `/images/logo.png`
- **Subdomínio:** Nenhum

### **Hub2You**
- **Cores:** Claro (branco/azul)
- **Logo:** `/images/logos/hub2you-logo.png`
- **Subdomínio:** `hub2you`

---

## ➕ Adicionar Novo Tema

### **Passo 1:** Criar arquivo do tema

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
    border: {
      primary: 'border-gray-200',
      secondary: 'border-gray-300',
      accent: 'border-purple-500',
    },
    button: {
      primary: 'bg-purple-600 hover:bg-purple-700 text-white',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
      ghost: 'text-gray-700 hover:text-gray-900 hover:bg-gray-100',
      outline: 'border-gray-300 text-gray-700 hover:bg-gray-50',
    },
    accent: {
      primary: 'bg-purple-50 border-purple-200 text-purple-800',
      success: 'bg-green-50 border-green-200 text-green-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      error: 'bg-red-50 border-red-200 text-red-800',
    },
  },
  cssVariables: {
    '--primary': '271.5 81.3% 55.9%',
    '--background': '0 0% 100%',
    '--foreground': '222.2 84% 4.9%',
    // ... copiar do hub2you.ts
  },
};
```

### **Passo 2:** Registrar no mapeamento

`src/config/themes/index.ts`:
```typescript
import { clienteTheme } from './cliente';

const themeMap: Record<string, Theme> = {
  'hub2you': hub2youTheme,
  'cliente': clienteTheme,  // ← Adicionar
  'default': defaultTheme,
};
```

### **Passo 3:** Adicionar logo

Colocar em: `public/images/logos/cliente-logo.png`

---

## 🧪 Testar

### **Método 1: /etc/hosts**

Adicionar:
```
127.0.0.1 hub2you.localhost
127.0.0.1 cliente.localhost
```

Acessar:
- `http://localhost:3000` → Tema padrão
- `http://hub2you.localhost:3000` → Tema Hub2You

### **Método 2: Página de Teste**

Acessar: `http://localhost:3000/theme-test`

### **Método 3: Forçar tema (temporário)**

Em `src/config/themes/index.ts`:
```typescript
export function getSubdomain(): string | null {
  return 'hub2you'; // Forçar para teste
}
```

⚠️ **Reverter após teste!**

---

## 📦 Deploy

### **1. Configurar DNS**
```
hub2you.autonomia.site → CNAME → autonomia.site
cliente.autonomia.site → CNAME → autonomia.site
```

### **2. Adicionar logos**
```
public/images/logos/hub2you-logo.png
public/images/logos/cliente-logo.png
```

### **3. Build**
```bash
npm run build
```

---

## 🔍 Páginas já Temalizadas

- ✅ `/login` - Página de login com tema dinâmico
- ✅ `/theme-test` - Página de demonstração

### **Próximas páginas a tematizar:**
- [ ] `/onboarding`
- [ ] `/campaigns`
- [ ] `/monitoring`
- [ ] `/conversations`
- [ ] `/kanban`
- [ ] `/projects`
- [ ] `/settings`

---

## 💡 Propriedades do Tema

### **theme.name**
Nome do tema (string)

### **theme.logo**
Caminho do logo (string)

### **theme.colors**
Objeto com todas as classes Tailwind:
- `background.*` - Fundos
- `text.*` - Textos
- `border.*` - Bordas
- `button.*` - Botões
- `accent.*` - Alertas

### **theme.cssVariables**
Variáveis CSS para shadcn/ui

### **subdomain**
Subdomínio detectado (string | null)

---

## 📝 Exemplo Completo

```tsx
"use client";

import { useTheme } from '@/contexts/ThemeContext';
import Image from 'next/image';

export default function MyPage() {
  const { theme, subdomain } = useTheme();

  return (
    <div className={`min-h-screen ${theme.colors.background.primary} p-8`}>
      {/* Logo dinâmico */}
      <Image 
        src={theme.logo} 
        alt="Logo" 
        width={150} 
        height={150}
        onError={(e) => e.currentTarget.src = '/images/logo.png'}
      />
      
      {/* Card */}
      <div className={`p-6 rounded-lg border ${theme.colors.background.card} ${theme.colors.border.primary}`}>
        <h1 className={`text-2xl font-bold ${theme.colors.text.primary}`}>
          Bem-vindo, {subdomain || 'visitante'}!
        </h1>
        
        <p className={theme.colors.text.secondary}>
          Você está usando o tema: {theme.name}
        </p>
        
        {/* Botões */}
        <div className="flex gap-4 mt-4">
          <button className={theme.colors.button.primary}>
            Primário
          </button>
          <button className={theme.colors.button.secondary}>
            Secundário
          </button>
        </div>
        
        {/* Alerta */}
        <div className={`mt-4 p-4 rounded-lg border ${theme.colors.accent.success}`}>
          <p className="font-semibold">Sucesso!</p>
          <p className="text-sm">Tema carregado corretamente</p>
        </div>
      </div>
    </div>
  );
}
```

---

## 🎯 Checklist de Deploy

- [ ] Criar logo Hub2You: `public/images/logos/hub2you-logo.png`
- [ ] Configurar DNS para `hub2you.autonomia.site`
- [ ] Testar em staging
- [ ] Build de produção
- [ ] Deploy
- [ ] Testar em produção

---

## 📚 Documentação

**Completa:** Ver `THEMING_SYSTEM.md`  
**Teste ao vivo:** Acessar `/theme-test`  
**Exemplo de código:** Ver `src/components/ThemeExample.tsx`

---

**Status:** ✅ Implementação Completa  
**Data:** 17/11/2025  
**Versão:** 1.0.0
