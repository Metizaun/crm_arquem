import { Lead } from "@/hooks/useLeads";
import { KanbanColumn as KanbanColumnType } from "@/types";
import { LeadCard } from "./LeadCard";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useApp } from "@/context/AppContext";

interface KanbanColumnProps {
  column: KanbanColumnType;
  leads: Lead[];
  onDragStart: (lead: Lead) => void;
  onDragEnd: () => void;
  onDrop: (columnId: Lead["status"]) => void;
  isDragging: boolean;
}

const colorPalette = [
  { name: "Azul", value: "hsl(199, 89%, 48%)" },
  { name: "Amarelo", value: "hsl(48, 96%, 53%)" },
  { name: "Roxo", value: "hsl(262, 52%, 47%)" },
  { name: "Verde", value: "hsl(142, 71%, 45%)" },
  { name: "Vermelho", value: "hsl(0, 84%, 60%)" },
  { name: "Rosa", value: "hsl(280, 65%, 60%)" },
  { name: "Laranja", value: "hsl(25, 95%, 53%)" },
  { name: "Ciano", value: "hsl(180, 75%, 45%)" },
];

export function KanbanColumn({
  column,
  leads,
  onDragStart,
  onDragEnd,
  onDrop,
  isDragging,
}: KanbanColumnProps) {
  const { updateKanbanColumn } = useApp();
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    onDrop(column.id);
  };

  return (
    <div
      className={cn(
        "flex-1 min-w-0 bg-card bg-card rounded-lg border border-border transition-all relative flex flex-col",
        isDragOver && "column-drag-active"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role="list"
      aria-label={`Coluna ${column.name}`}
    >
      {/* Linha superior colorida (4px) */}
      <div
  className={cn(
    "kanban-light-bar",
    isDragOver && "kanban-light-bar-active"
  )}
  style={{
    "--kanban-color": column.color,
  } as any}
/>




      {/* Header */}
      <div
        className="p-4 border-b border-border flex items-center justify-between"
        style={{ backgroundColor: column.color + "15" }}
      >
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">{column.name}</h3>
          <span className="text-xs text-muted-foreground">({leads.length})</span>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Palette className="w-3.5 h-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-3">
            <p className="text-sm font-medium mb-2">Cor da coluna</p>
            <div className="grid grid-cols-4 gap-2">
              {colorPalette.map((color) => (
                <button
                  key={color.value}
                  className="w-8 h-8 rounded-md hover:scale-110 transition-transform focus-ring"
                  style={{ backgroundColor: color.value }}
                  onClick={() => updateKanbanColumn(column.id, color.value)}
                  aria-label={color.name}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Cards - sem scroll interno, coluna cresce naturalmente */}
      <div
        className={cn(
          "p-3 space-y-2",
          isDragOver && "drag-placeholder"
        )}
      >
        {leads.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Nenhum lead nesta etapa
          </div>
        ) : (
          leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onDragStart={() => onDragStart(lead)}
              onDragEnd={onDragEnd}
            />
          ))
        )}
      </div>
    </div>
  );
}
