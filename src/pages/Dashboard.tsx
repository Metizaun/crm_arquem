import { useLeads } from "@/hooks/useLeads";
import { useApp } from "@/context/AppContext";
import { KPICard } from "@/components/KPICard";
import { LineChart } from "@/components/charts/LineChart";
import { BarChart } from "@/components/charts/BarChart";
import { FunnelChart } from "@/components/charts/FunnelChart";
import { RevenueByVendorChart } from "@/components/charts/RevenueByVendorChart";
import { TrendingUp, Users, DollarSign, Target, UserCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import { startOfDay, subDays, parseISO, isAfter, isBefore } from "date-fns";
import { 
  groupLeadsByDay, 
  groupLeadsByOrigin, 
  computeFunnelData, 
  groupRevenueByVendor 
} from "@/lib/utils/metrics";

export default function Dashboard() {
  const { leads, loading } = useLeads();
  const { ui, setPeriodFilter } = useApp();
  const [selectedVendor, setSelectedVendor] = useState<string>("todos");
  
  const vendors = useMemo(() => {
    const uniqueVendors = Array.from(new Set(leads.map(l => l.owner_name).filter(Boolean)));
    return uniqueVendors.sort();
  }, [leads]);
  
  // Filter by period
  const periodFilteredLeads = useMemo(() => {
    const now = new Date();
    const today = startOfDay(now);
    
    return leads.filter((lead) => {
      const createdDate = parseISO(lead.created_at);
      
      switch (ui.periodFilter) {
        case "hoje":
          return isAfter(createdDate, today);
        case "7d":
          return isAfter(createdDate, subDays(now, 7));
        case "30d":
          return isAfter(createdDate, subDays(now, 30));
        case "custom":
          if (ui.customRange.from && ui.customRange.to) {
            return isAfter(createdDate, ui.customRange.from) && isBefore(createdDate, ui.customRange.to);
          }
          return true;
        default:
          return true;
      }
    });
  }, [leads, ui.periodFilter, ui.customRange]);
  
  // Filter by vendor
  const filteredLeads = useMemo(() => {
    if (selectedVendor === "todos") return periodFilteredLeads;
    return periodFilteredLeads.filter(lead => lead.owner_name === selectedVendor);
  }, [periodFilteredLeads, selectedVendor]);
  
  // Compute KPIs
  const kpis = useMemo(() => {
    const totalLeads = filteredLeads.length;
    const negociosGanhos = filteredLeads.filter(l => l.status === "Fechado").length;
    const valorTotal = filteredLeads
      .filter(l => l.status === "Fechado")
      .reduce((sum, l) => sum + (l.value || 0), 0);
    const taxaConversao = totalLeads > 0 ? (negociosGanhos / totalLeads) * 100 : 0;
    
    return { totalLeads, negociosGanhos, valorTotal, taxaConversao };
  }, [filteredLeads]);

  // Converter leads para formato antigo para métricas
  const convertedLeads = useMemo(() => {
    return filteredLeads.map(l => ({
      ...l,
      nome: l.lead_name,
      cidade: l.last_city || '',
      email: l.email || '',
      telefone: l.contact_phone || '',
      origem: l.source || '',
      conexao: (l.connection_level || 'Média') as "Baixa" | "Média" | "Alta",
      valor: l.value || 0,
      dataCriacao: l.created_at,
      responsavel: l.owner_name || '',
      observacoes: ''
    }));
  }, [filteredLeads]);

  const dailyData = useMemo(() => groupLeadsByDay(convertedLeads as any), [convertedLeads]);
  const originData = useMemo(() => groupLeadsByOrigin(convertedLeads as any), [convertedLeads]);
  const funnelData = useMemo(() => computeFunnelData(convertedLeads as any), [convertedLeads]);
  const revenueByVendor = useMemo(() => groupRevenueByVendor(convertedLeads as any), [convertedLeads]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Visão geral do desempenho de vendas
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={selectedVendor} onValueChange={setSelectedVendor}>
            <SelectTrigger className="w-full sm:w-[210px]">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <UserCircle className="w-4 h-4" />
                <div className="flex-1 min-w-0">
                  <SelectValue className="truncate block" placeholder="Todos os vendedores" />
                </div>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os vendedores</SelectItem>
              {vendors.map((vendor) => (
                <SelectItem key={vendor} value={vendor!}>
                  {vendor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={ui.periodFilter} onValueChange={(value: any) => setPeriodFilter(value)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex-1 min-w-0">
                  <SelectValue className="truncate block" />
                </div>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hoje">Hoje</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="total">Total</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedVendor !== "todos" && (
        <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm">
          <span className="font-medium">Filtrando por vendedor:</span> {selectedVendor}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-0">
        <KPICard
          title="Total de Leads"
          value={kpis.totalLeads}
          icon={Users}
          subtitle="leads no período"
        />
        <KPICard
          title="Negócios Ganhos"
          value={kpis.negociosGanhos}
          icon={Target}
          subtitle="vendas fechadas"
        />
        <KPICard
          title="Receita Total"
          value={
            <>
              R${" "}
              <span className="whitespace-nowrap">
                {kpis.valorTotal.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </>
          }
          icon={DollarSign}
          subtitle="valor total fechado"
        />
        <KPICard
          title="Taxa de Conversão"
          value={`${kpis.taxaConversao.toFixed(1)}%`}
          icon={TrendingUp}
          subtitle="leads → vendas"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart data={dailyData} title="Evolução de Leads" />
        <BarChart data={originData} title="Leads por Origem" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FunnelChart data={funnelData} title="Funil de Vendas" />
        <RevenueByVendorChart data={revenueByVendor} title="Receita por Vendedor" />
      </div>
    </div>
  );
}
