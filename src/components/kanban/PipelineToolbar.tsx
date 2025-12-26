import { Plus, HelpCircle, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface PipelineToolbarProps {
  onAddLead: () => void;
  selectedVendor: string;
  onVendorChange: (vendor: string) => void;
  vendorOptions: string[];
}

export function PipelineToolbar({
  onAddLead,
  selectedVendor,
  onVendorChange,
  vendorOptions
}: PipelineToolbarProps) {
  return (
    <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg">
      <Button onClick={onAddLead} size="default" className="gap-2">
        <Plus className="w-4 h-4" />
        Novo Lead
      </Button>

      <Select value={selectedVendor} onValueChange={onVendorChange}>
        <SelectTrigger className="w-[240px]">
          <UserCircle className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Todos os Vendedores" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Vendedores</SelectItem>
          {vendorOptions.map((vendor) => (
            <SelectItem key={vendor} value={vendor}>
              {vendor}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon">
            <HelpCircle className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-2">
            <h4 className="font-semibold">Atalhos do Pipeline</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li><kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">N</kbd> - Novo Lead</li>
              <li><kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">M</kbd> - Mover lead focado</li>
              <li><kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Arrastar</kbd> - Mover entre colunas</li>
              <li><kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Enter</kbd> - Abrir detalhes</li>
            </ul>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
