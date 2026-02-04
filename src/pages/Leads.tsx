import { useLeads } from "@/hooks/useLeads";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Plus, Download, Pencil } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, startOfDay, endOfDay } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";
import EditLeadModal from "@/components/modals/EditLeadModal";
import { Lead } from "@/hooks/useLeads";
import { exportToCSV, exportGenericToCSV } from "@/lib/utils/export";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";

export default function Leads() {
  const { leads, loading, refetch } = useLeads();
  const { ui, openModal } = useApp();
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
  const filteredLeads = leads.filter((lead) => {
    if (!ui.searchQuery) return true;
    const query = ui.searchQuery.toLowerCase();
    return (
      lead.lead_name.toLowerCase().includes(query) ||
      lead.email?.toLowerCase().includes(query) ||
      lead.contact_phone?.toLowerCase().includes(query) ||
      lead.source?.toLowerCase().includes(query)
    );
  });

  const handleExport = async () => {
    try {
      // 1. Obter o usuário autenticado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error("Erro ao obter usuário autenticado");
      }

      // 2. Buscar o aces_id do usuário
      const { data: userData, error: userDataError } = await supabase
        .from('users')
        .select('aces_id')
        .eq('auth_user_id', user.id)
        .single();

      if (userDataError) {
        throw new Error("Erro ao buscar dados do usuário");
      }

      const acesId = userData?.aces_id;

      // 3. Verificar se é o aces_id especial (535)
      if (acesId === 535) {
        // Buscar dados da view vw_relatorio_leads com filtro de datas (data_entrada)
        let query = supabase
          .from('vw_relatorio_leads')
          .select('*');

        if (dateRange?.from) {
          const from = startOfDay(dateRange.from).toISOString();
          query = query.gte('data_entrada', from);
        }

        if (dateRange?.to) {
          const to = endOfDay(dateRange.to).toISOString();
          query = query.lte('data_entrada', to);
        }

        const { data: viewData, error: viewError } = await query;

        if (viewError) {
          throw new Error(`Erro ao buscar dados da view: ${viewError.message}`);
        }

        if (!viewData || viewData.length === 0) {
          toast.error("Não há dados na view para exportar");
          return;
        }

        // Exportar usando a função genérica
        exportGenericToCSV(viewData, `relatorio-leads-${format(new Date(), "dd-MM-yyyy")}.csv`);
        toast.success("Download iniciado!");
      } else {
        // Comportamento normal: exportar leads filtrados
        if (filteredLeads.length === 0) {
          toast.error("Não há leads para exportar");
          return;
        }

        exportToCSV(filteredLeads, `leads-export-${format(new Date(), "dd-MM-yyyy")}.csv`);
        toast.success("Download iniciado!");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erro ao exportar CSV");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Leads</h1>
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ... O restante do seu JSX continua igual ... */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-muted-foreground mt-1">
            {filteredLeads.length} lead{filteredLeads.length !== 1 ? "s" : ""} encontrado
            {filteredLeads.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                {dateRange?.from && dateRange?.to
                  ? `${format(dateRange.from, "dd/MM/yyyy")} - ${format(dateRange.to, "dd/MM/yyyy")}`
                  : dateRange?.from
                  ? `A partir de ${format(dateRange.from, "dd/MM/yyyy")}`
                  : "Selecionar período"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="end">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
              <div className="flex justify-end pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDateRange(undefined)}
                >
                  Limpar
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          {/* O botão já chama handleExport, então está pronto */}
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
          <Button onClick={() => openModal("createLead")}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Lead
          </Button>
        </div>
      </div>
      
      {/* ... Restante da tabela ... */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
            {/* ... Conteúdo da tabela mantido ... */}
            <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Conexão</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                  Nenhum lead encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => (
                <TableRow key={lead.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{lead.lead_name}</TableCell>
                  <TableCell>{lead.last_city || "-"}</TableCell>
                  <TableCell>{lead.email || "-"}</TableCell>
                  <TableCell>{lead.contact_phone || "-"}</TableCell>
                  <TableCell>{lead.source || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{lead.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {lead.value !== null && lead.value !== undefined
                      ? `R$ ${lead.value.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {lead.connection_level ? (
                      <Badge
                        variant={
                          lead.connection_level === "Alta"
                            ? "default"
                            : lead.connection_level === "Média"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {lead.connection_level}
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {format(parseISO(lead.created_at), "dd/MM/yy")}
                  </TableCell>
                  <TableCell>{lead.owner_name || "-"}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingLead(lead)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <EditLeadModal
        lead={editingLead}
        open={!!editingLead}
        onClose={() => setEditingLead(null)}
        onSuccess={() => {
          refetch();
          setEditingLead(null);
        }}
      />
    </div>
  );
}
