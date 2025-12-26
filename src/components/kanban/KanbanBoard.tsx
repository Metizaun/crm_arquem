import { useState } from "react";
import { Lead } from "@/hooks/useLeads";
import { KanbanColumn } from "./KanbanColumn";
import { useLeadOperations } from "@/hooks/useLeadOperations";
import { KanbanColumn as KanbanColumnType } from "@/types";

const DEFAULT_COLUMNS: KanbanColumnType[] = [
  { id: "Novo", name: "Novo", color: "#3b82f6" },
  { id: "Atendimento", name: "Atendimento", color: "#f59e0b" },
  { id: "Orçamento", name: "Orçamento", color: "#8b5cf6" },
  { id: "Fechado", name: "Fechado", color: "#10b981" },
  { id: "Perdido", name: "Perdido", color: "#ef4444" },
  { id: "Remarketing", name: "Remarketing", color: "#6366f1" },
];

export function KanbanBoard({ leads }: { leads: Lead[] }) {
  const { updateLeadStatus } = useLeadOperations();
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);

  const handleDragStart = (lead: Lead) => {
    setDraggedLead(lead);
  };

  const handleDragEnd = () => {
    setDraggedLead(null);
  };

  const handleDrop = async (columnId: string) => {
    if (draggedLead && draggedLead.status !== columnId) {
      await updateLeadStatus(draggedLead.id, columnId);
    }
    setDraggedLead(null);
  };

  const groupedLeads = DEFAULT_COLUMNS.reduce((acc, col) => {
    acc[col.id] = leads.filter((lead) => lead.status === col.id);
    return acc;
  }, {} as Record<string, Lead[]>);

  return (
    <div className="flex w-full gap-3 pb-4">
      {DEFAULT_COLUMNS.map((column) => (
        <KanbanColumn
          key={column.id}
          column={column}
          leads={groupedLeads[column.id] || []}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDrop={handleDrop}
          isDragging={draggedLead?.status === column.id}
        />
      ))}
    </div>
  );
}
