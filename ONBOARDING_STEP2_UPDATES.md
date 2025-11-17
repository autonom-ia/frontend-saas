# StepConfigureAccount - Atualizações

## Mudanças Implementadas

### **1. Campos Fixos da Conta**

Adicionados 3 campos obrigatórios no início do formulário:

#### **Nome da Conta**
- Input de texto
- Validação: obrigatório
- Placeholder: "Ex: Atendimento Principal"
- Tooltip: "Escolha um nome descritivo para identificar esta conta"

#### **Email**
- Input type="email"
- Validação: obrigatório + formato de email
- Placeholder: "Ex: contato@empresa.com"
- Tooltip: "Email para notificações e recuperação de acesso"

#### **Número de Telefone**
- Input type="tel"
- Validação: obrigatório + 10-15 dígitos
- Placeholder: "Ex: 5511999999999"
- Auto-limpeza: remove caracteres não numéricos
- **Warning Box:** Alerta visual sobre usar número exclusivo

**Warning Box:**
```
⚠️ Número Exclusivo
Use um número dedicado exclusivamente ao atendimento virtual.
NÃO use um número já vinculado a outro WhatsApp.
Recomendamos adquirir um chip novo.
```

---

### **2. Campos Dinâmicos - Sempre Vazios Inicialmente**

**Antes:**
```typescript
initialData[param.name] = param.value || param.default_value || '';
```

**Depois:**
```typescript
initialData[param.name] = ''; // Sempre vazio inicialmente
```

**Campos JSON:**
```typescript
const fields = Object.entries(jsonObj).map(([key, val]) => ({
  key,
  value: '' // Sempre vazio inicialmente
}));
```

---

### **3. Campos JSON - Placeholder Vazio**

**Antes:**
```tsx
<Input placeholder={`Digite ${field.key}`} />
```

**Depois:**
```tsx
<Input placeholder="" />
```

**Nota:** O label ainda mostra o nome da key (ex: "api_key").
Para mostrar descrições personalizadas, seria necessário criar uma estrutura como:
```json
{
  "api_key": {
    "value": "",
    "description": "Chave da API"
  }
}
```

---

### **4. Estrutura de Dados no Submit**

**handleContinue() agora envia:**
```typescript
{
  // Campos fixos
  accountName: "Atendimento Principal",
  accountEmail: "contato@empresa.com",
  accountPhone: "5511999999999",
  productId: "uuid-produto",
  
  // Parâmetros dinâmicos
  agent_name: "Maria",
  welcome_message: "Olá!",
  api_config: '{"apiKey":"abc","apiUrl":"https://..."}', // JSON string
  ...
}
```

---

### **5. Layout Atualizado**

```
┌──────────────────────────────────┐
│ Configure sua Conta              │
├──────────────────────────────────┤
│ ▼ Dados da Conta                 │
│   - Nome da Conta *              │
│   - Email *                      │
│   - Telefone * [Warning Box]     │
├──────────────────────────────────┤
│ ▼ Configurações Adicionais       │
│   (Renderizado dinamicamente)    │
│   - Parâmetros do produto        │
└──────────────────────────────────┘
```

---

## Validações Implementadas

### **Validação de Nome:**
- ✅ Não pode estar vazio
- ✅ Trim automático

### **Validação de Email:**
- ✅ Não pode estar vazio
- ✅ Formato de email válido (regex)

### **Validação de Telefone:**
- ✅ Não pode estar vazio
- ✅ 10-15 dígitos numéricos
- ✅ Auto-limpeza de caracteres especiais

### **Exibição de Erros:**
```tsx
{validationErrors.accountName && (
  <p className="text-red-400 text-xs">{validationErrors.accountName}</p>
)}
```

---

## Próximos Passos

### **Backend - Criar Endpoint POST /Accounts**

Endpoint deve receber:
```json
{
  "name": "Atendimento Principal",
  "email": "contato@empresa.com",
  "phone": "5511999999999",
  "product_id": "uuid",
  "parameters": {
    "agent_name": "Maria",
    "welcome_message": "Olá!",
    "api_config": "{\"apiKey\":\"abc\"}"
  }
}
```

Deve:
1. ✅ Criar registro em `account` (name, email, phone, product_id)
2. ✅ Criar registros em `account_parameter` para cada parâmetro
3. ✅ Retornar account_id criado

### **Frontend - Próximo Step**

No Step 3 (WhatsApp):
- Usar `accountId` retornado
- Gerar QR Code para vincular WhatsApp
- Usar `accountPhone` para instrução

---

## Melhorias Futuras (Opcional)

### **1. Descrições Personalizadas para Keys JSON**

Criar estrutura:
```json
{
  "api_config": {
    "fields": [
      {"key": "apiKey", "label": "Chave da API", "type": "password"},
      {"key": "apiUrl", "label": "URL do Endpoint", "type": "url"}
    ]
  }
}
```

### **2. Tipos de Campo Específicos**

- `type: "password"` → Input type="password"
- `type: "url"` → Validação de URL
- `type: "number"` → Input type="number"

### **3. Validações Customizadas**

Adicionar em `account_parameters_standard`:
- `required: boolean`
- `validation_regex: string`
- `min_length: number`
- `max_length: number`

---

## Resumo das Mudanças

1. ✅ Adicionados campos fixos: Nome, Email, Telefone
2. ✅ Validação completa dos campos fixos
3. ✅ Warning box para telefone exclusivo
4. ✅ Todos os campos iniciam vazios
5. ✅ Placeholder vazio em campos JSON
6. ✅ Dados combinados no submit (fixos + dinâmicos)
7. ✅ Layout separado em 2 Cards (Dados da Conta + Configurações)
