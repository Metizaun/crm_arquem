export type LeadStatus = "Novo" | "Atendimento" | "Orçamento" | "Fechado" | "Perdido" | "Remarketing";
export type UserRole = "admin" | "vendedor";
export type PeriodFilter = "hoje" | "7d" | "30d" | "total" | "custom";

export interface Lead {
  id: string;
  nome: string;
  cidade: string;
  email: string;
  telefone: string;
  origem: string;
  conexao: "Baixa" | "Média" | "Alta";
  valor: number;
  dataCriacao: string;
  responsavel: string;
  status: LeadStatus;
  observacoes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface KanbanColumn {
  id: LeadStatus;
  name: string;
  color: string;
}

export interface Toast {
  id: string;
  message: string;
  type?: "success" | "error" | "info";
  action?: {
    label: string;
    handler: () => void;
  };
}

export interface AppState {
  currentUser: User;
  users: User[];
  leads: Lead[];
  ui: {
    theme: "dark" | "light";
    periodFilter: PeriodFilter;
    customRange: { from: Date | null; to: Date | null };
    searchQuery: string;
    toastQueue: Toast[];
    modal: { type: string; payload?: any } | null;
    drawerLeadId: string | null;
    kanbanColumns: KanbanColumn[];
  };
}
