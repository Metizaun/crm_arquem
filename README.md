# CRM Ótica - Sistema de Gestão de Vendas

Sistema completo de CRM para gerenciamento de leads e vendas de ótica, desenvolvido com React, TypeScript e Tailwind CSS.

## 🎯 Funcionalidades

### Pipeline Kanban
- ✅ Visualização em colunas personalizáveis (Novo, Atendimento, Orçamento, Fechado, Perdido, Remarketing)
- ✅ Drag & drop para mover leads entre etapas
- ✅ Customização de cores das colunas (estilo Notion)
- ✅ Cards informativos com dados-chave dos leads

### Dashboard Analítico
- ✅ KPIs principais: Total de Leads, Negócios Ganhos, Receita Total, Taxa de Conversão
- ✅ Gráficos de tendência por dia
- ✅ Análise por origem de leads
- ✅ Funil de vendas visual
- ✅ Filtros por período (Hoje, 7 dias, 30 dias, Total)

### Gestão de Leads
- ✅ CRUD completo (Criar, Ler, Atualizar, Deletar)
- ✅ Tabela com todas as informações
- ✅ Export para CSV
- ✅ Busca global em tempo real
- ✅ Drawer de detalhes com ações rápidas

### Recursos Avançados
- ✅ Tema Dark/Light com toggle animado
- ✅ Persistência local (LocalStorage)
- ✅ Sistema de Undo para ações críticas
- ✅ Toasts informativos
- ✅ Atalhos de teclado
- ✅ Acessibilidade (ARIA labels, keyboard navigation)
- ✅ Animações e microinterações

### Admin
- ✅ Gestão de usuários
- ✅ Reset de dados
- ✅ Visualização de configurações

## ⌨️ Atalhos de Teclado

- `Ctrl/Cmd + K` - Busca global
- `/` - Focar no campo de busca
- `N` - Criar novo lead
- `M` - Mover lead focado (no Kanban)

## 🎨 Design System

- **Background Principal**: `#161616`
- **Surface/Cards**: `#1E1E1E`
- **Texto**: `#F5F5F5`
- **Accent/Primary**: `#C9A66B` (dourado)
- **Success**: Verde
- **Warning**: Amarelo
- **Destructive**: Vermelho

## 🚀 Começando

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm run dev
```

### Build

```bash
npm run build
```

## 📊 Estrutura de Dados

### Lead
```typescript
{
  id: string
  nome: string
  cidade: string
  email: string
  telefone: string
  origem: string
  conexao: "Baixa" | "Média" | "Alta"
  valor: number
  dataCriacao: string (ISO)
  responsavel: string
  status: "Novo" | "Atendimento" | "Orçamento" | "Fechado" | "Perdido" | "Remarketing"
  observacoes?: string
}
```

### User
```typescript
{
  id: string
  name: string
  email: string
  role: "admin" | "vendedor"
}
```

## 🔮 Futuras Integrações

Este protótipo está preparado para integração com Supabase:
- Autenticação de usuários
- Database PostgreSQL
- Storage para arquivos
- Edge Functions para APIs

## 🎓 Tecnologias

- **React 18** - Framework UI
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Shadcn/ui** - Component library
- **Recharts** - Data visualization
- **date-fns** - Date handling
- **Sonner** - Toast notifications
- **React Router** - Navigation

## 📝 Mock Data

O sistema vem com 10 leads de exemplo e 2 usuários (1 admin + 1 vendedor) para facilitar os testes.

## 🔒 Roles e Permissões

- **Admin**: Acesso completo + página de administração
- **Vendedor**: Acesso a Dashboard, Pipeline, Leads e Chat

## 🎯 Critérios de Aceitação

✅ CRUD de leads funcional
✅ Kanban com drag & drop
✅ Dashboard com métricas e gráficos
✅ Export CSV
✅ Theme toggle
✅ Busca em tempo real
✅ Atalhos de teclado
✅ Sistema de undo
✅ Toasts informativos
✅ Acessibilidade básica
✅ Animações suaves
✅ Responsividade

---

Desenvolvido com ❤️ para gestão eficiente de vendas de ótica
