import { useState } from "react";
import { useLeads } from "@/hooks/useLeads";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { PipelineToolbar } from "@/components/kanban/PipelineToolbar";
import { useApp } from "@/context/AppContext";

export default function Pipeline() {
  const { leads, loading } = useLeads();
  const { ui, openModal } = useApp();
  const [selectedVendor, setSelectedVendor] = useState<string>("all");

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = !ui.searchQuery || 
      lead.lead_name.toLowerCase().includes(ui.searchQuery.toLowerCase()) ||
      lead.email?.toLowerCase().includes(ui.searchQuery.toLowerCase()) ||
      lead.contact_phone?.toLowerCase().includes(ui.searchQuery.toLowerCase());
    
    const matchesVendor = selectedVendor === "all" || lead.owner_name === selectedVendor;
    
    return matchesSearch && matchesVendor;
  });

  const vendorOptions = Array.from(
    new Set(leads.map((lead) => lead.owner_name).filter(Boolean))
  ) as string[];

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Pipeline</h1>
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Pipeline</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie seus leads através do funil de vendas
        </p>
      </div>

      <PipelineToolbar
        onAddLead={() => openModal("createLead")}
        selectedVendor={selectedVendor}
        onVendorChange={setSelectedVendor}
        vendorOptions={vendorOptions}
      />

      <KanbanBoard leads={filteredLeads} />
    </div>
  );
}
