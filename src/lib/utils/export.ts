import { Lead } from "@/hooks/useLeads"; // Ajustado para pegar o tipo correto
import { format, parseISO } from "date-fns";

export function exportToCSV(leads: Lead[], filename: string = "leads.csv") {
  const headers = [
    "Nome",
    "Cidade",
    "Email",
    "Telefone",
    "Origem",
    "Status",
    "Valor",
    "Conexão",
    "Data Criação",
    "Responsável",
  ];

  const escapeQuotes = (str: unknown) => {
    if (str === null || str === undefined) return "";
    const stringValue = String(str);
    return `"${stringValue.replace(/"/g, '""')}"`;
  };

  const rows = leads.map((lead) => [
    escapeQuotes(lead.lead_name),
    escapeQuotes(lead.last_city),
    escapeQuotes(lead.email),
    escapeQuotes(lead.contact_phone),
    escapeQuotes(lead.source),
    escapeQuotes(lead.status),
    // Formata o valor para padrão brasileiro se existir, senão vazio
    lead.value ? `"${lead.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}"` : "", 
    escapeQuotes(lead.connection_level),
    // Formata a data apenas se existir
    lead.created_at ? escapeQuotes(format(parseISO(lead.created_at), "dd/MM/yyyy")) : "",
    escapeQuotes(lead.owner_name),
  ]);

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

  // Adiciona BOM para o Excel reconhecer acentos corretamente
  const bom = "\uFEFF"; 
  const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}