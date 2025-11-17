# Páginas com Tema Dinâmico Aplicado

## ✅ Páginas Temáticas

### **1. Login** (`/login`)
- ✅ Background dinâmico
- ✅ Logo dinâmico
- ✅ Botões temáticos
- ✅ Textos temáticos
- ✅ Cards temáticos

### **2. Onboarding** (`/onboarding`)
- ✅ Background dinâmico
- ✅ Logo dinâmico no header
- ✅ Botões temáticos
- ✅ Textos temáticos
- ✅ Header temático

### **3. Campaigns** (`/campaigns`)
- ✅ Background principal dinâmico
- ✅ useTheme importado
- ⚠️ Tabelas e cards internos ainda com classes hard-coded (necessita refatoração)

### **4. Theme Test** (`/theme-test`)
- ✅ Página de demonstração completa

## 📋 Próximas Páginas (Aplicar Tema)

### **Páginas Principais**
- [ ] `/monitoring` - Página de monitoramento
- [ ] `/conversations` - Conversas
- [ ] `/settings` - Configurações
- [ ] `/kanban` - Kanban
- [ ] `/projects` - Projetos

### **Páginas de Autenticação**
- [ ] `/confirm-email` - Confirmar email
- [ ] `/forgot-password` - Esqueci senha
- [ ] `/reset-password` - Resetar senha

### **Página Home**
- [ ] `/` (page.tsx) - Home/Landing

---

## 🔧 Checklist para Aplicar Tema em Nova Página

1. **Importar useTheme:**
```tsx
import { useTheme } from '@/contexts/ThemeContext';
```

2. **Usar hook:**
```tsx
const { theme } = useTheme();
```

3. **Substituir classes:**
```tsx
// ANTES
className="bg-gray-900 text-white"

// DEPOIS
className={theme.colors.background.primary}
className={theme.colors.text.primary}
```

4. **Logo dinâmico:**
```tsx
<Image 
  src={theme.logo} 
  alt="Logo"
  onError={(e) => e.currentTarget.src = '/images/logo.png'}
/>
```

---

## 📊 Progresso

- **Total de páginas:** 13
- **Temáticas:** 4 (31%)
- **Pendentes:** 9 (69%)

---

## 🚀 Deploy

**Antes do deploy:**
1. Reverter em `src/config/themes/index.ts`:
```typescript
// Remover linha:
return 'hub2you';

// Descomentar código original
```

2. Adicionar logo Hub2You:
```
public/images/logos/hub2you-logo.png
```

3. Testar build:
```bash
npm run build
```

---

**Atualizado:** 17/11/2025
