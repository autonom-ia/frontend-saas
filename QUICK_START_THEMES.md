# Guia Rápido - Sistema de Temas

## 🚀 Uso Básico

### **Importar e usar:**

```tsx
"use client";

import { useTheme } from '@/contexts/ThemeContext';

export default function MyComponent() {
  const { theme, subdomain } = useTheme();

  return (
    <div className={theme.colors.background.primary}>
      <h1 className={theme.colors.text.primary}>
        Olá!
      </h1>
      <button className={theme.colors.button.primary}>
        Clique
      </button>
    </div>
  );
}
```

---

## 🎨 Classes Disponíveis

### **Backgrounds**
```tsx
theme.colors.background.primary    // Fundo principal
theme.colors.background.secondary  // Fundo secundário
theme.colors.background.card       // Fundo de cards
theme.colors.background.hover      // Estado hover
```

### **Textos**
```tsx
theme.colors.text.primary     // Título/texto principal
theme.colors.text.secondary   // Subtítulo/descrição
theme.colors.text.muted       // Texto suavizado
theme.colors.text.accent      // Destaque/link
```

### **Botões**
```tsx
theme.colors.button.primary    // Botão primário
theme.colors.button.secondary  // Botão secundário
theme.colors.button.ghost      // Botão ghost
theme.colors.button.outline    // Botão com borda
```

### **Alertas**
```tsx
theme.colors.accent.primary   // Info (azul)
theme.colors.accent.success   // Sucesso (verde)
theme.colors.accent.warning   // Aviso (amarelo)
theme.colors.accent.error     // Erro (vermelho)
```

### **Bordas**
```tsx
theme.colors.border.primary    // Borda principal
theme.colors.border.secondary  // Borda secundária
theme.colors.border.accent     // Borda destaque
```

---

## 🖼️ Logo Dinâmico

```tsx
import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';

export default function Header() {
  const { theme } = useTheme();

  return (
    <Image 
      src={theme.logo} 
      alt="Logo" 
      width={150} 
      height={150}
      onError={(e) => {
        // Fallback para logo padrão
        e.currentTarget.src = '/images/logo.png';
      }}
    />
  );
}
```

---

## 📝 Exemplos Práticos

### **Card**
```tsx
const { theme } = useTheme();

<div className={`p-6 rounded-lg border ${theme.colors.background.card} ${theme.colors.border.primary}`}>
  <h2 className={theme.colors.text.primary}>Título</h2>
  <p className={theme.colors.text.secondary}>Descrição</p>
</div>
```

### **Alerta de Sucesso**
```tsx
const { theme } = useTheme();

<div className={`p-4 rounded-lg border ${theme.colors.accent.success}`}>
  <p className="font-semibold">Sucesso!</p>
  <p className="text-sm">Operação concluída</p>
</div>
```

### **Input**
```tsx
const { theme } = useTheme();

<input 
  type="text"
  className={`px-4 py-2 rounded border ${theme.colors.background.secondary} ${theme.colors.text.primary} ${theme.colors.border.secondary}`}
/>
```

### **Modal/Dialog**
```tsx
const { theme } = useTheme();

<div className={`fixed inset-0 ${theme.colors.background.primary} bg-opacity-50`}>
  <div className={`p-8 rounded-lg ${theme.colors.background.card} ${theme.colors.border.primary}`}>
    <h2 className={theme.colors.text.primary}>Modal</h2>
    <button className={theme.colors.button.primary}>OK</button>
  </div>
</div>
```

---

## 🧪 Testar Localmente

### **Ver página de teste:**
```
http://localhost:3000/theme-test
```

### **Forçar tema Hub2You:**
```typescript
// src/config/themes/index.ts (temporário)
export function getSubdomain(): string | null {
  return 'hub2you';
}
```

### **Usar /etc/hosts:**
```bash
sudo nano /etc/hosts

# Adicionar:
127.0.0.1 hub2you.localhost

# Acessar:
http://hub2you.localhost:3000
```

---

## ➕ Adicionar Novo Tema (3 minutos)

### **1. Copiar tema existente**
```bash
cp src/config/themes/hub2you.ts src/config/themes/cliente.ts
```

### **2. Editar cores**
```typescript
// src/config/themes/cliente.ts
export const clienteTheme: Theme = {
  name: 'cliente',
  logo: '/images/logos/cliente-logo.png',
  colors: {
    background: {
      primary: 'bg-gradient-to-br from-purple-50 via-white to-purple-50',
      // ... suas cores
    },
    // ...
  },
  cssVariables: {
    '--primary': '271.5 81.3% 55.9%', // Purple
    // ...
  },
};
```

### **3. Registrar tema**
```typescript
// src/config/themes/index.ts
import { clienteTheme } from './cliente';

const themeMap: Record<string, Theme> = {
  'hub2you': hub2youTheme,
  'cliente': clienteTheme, // ← Adicionar
  'default': defaultTheme,
};
```

### **4. Adicionar logo**
```
public/images/logos/cliente-logo.png
```

**Pronto!** 🎉

---

## 🎨 Paleta de Cores Sugerida

### **Para temas claros:**
```typescript
background.primary: 'bg-gradient-to-br from-[cor]-50 via-white to-[cor]-50'
background.secondary: 'bg-white'
text.primary: 'text-gray-900'
text.secondary: 'text-gray-700'
button.primary: 'bg-[cor]-600 hover:bg-[cor]-700 text-white'
```

### **Para temas escuros:**
```typescript
background.primary: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
background.secondary: 'bg-gray-800'
text.primary: 'text-white'
text.secondary: 'text-gray-300'
button.primary: 'bg-[cor]-600 hover:bg-[cor]-500 text-white'
```

---

## 🔍 Debug

### **Ver tema ativo no console:**
```javascript
// Console do navegador
console.log('[ThemeProvider] Subdomain:', subdomain);
console.log('[ThemeProvider] Theme loaded:', theme.name);
```

### **Ver CSS variables aplicadas:**
```javascript
// Console do navegador
getComputedStyle(document.documentElement).getPropertyValue('--primary')
```

---

## ⚠️ Dicas Importantes

### **❌ Evitar:**
```tsx
// Hard-coded (não adapta ao tema)
<div className="bg-gray-900 text-white">
```

### **✅ Preferir:**
```tsx
// Dinâmico (adapta automaticamente)
<div className={theme.colors.background.primary}>
  <span className={theme.colors.text.primary}>
```

### **🎯 Sempre usar:**
- `theme.colors.*` para classes Tailwind
- `theme.logo` para logo
- `theme.name` para identificação
- `subdomain` para lógica condicional

---

## 📚 Documentação Completa

**Ver:** `THEMING_SYSTEM.md`

---

**Criado:** 17/11/2025  
**Autor:** Sistema de Temas Autonomia
