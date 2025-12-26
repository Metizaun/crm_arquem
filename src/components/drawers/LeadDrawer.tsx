import { useState } from "react";
import { useLeads, Lead } from "@/hooks/useLeads";
import { useLeadOperations } from "@/hooks/useLeadOperations";
import { useApp } from "@/context/AppContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Mail,
  Phone,
  User,
  Calendar,
  FileText,
  MessageSquare,
  DollarSign,
  Signal,
  Edit,
  MessageCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import EditLeadModal from "@/components/modals/EditLeadModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function LeadDrawer() {
  const { ui, closeDrawer } = useApp();
  const { leads, refetch } = useLeads();
  const { updateLeadStatus } = useLeadOperations();
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  
  const lead = leads.find((l) => l.id === ui.drawerLeadId);

  const handleQuickUpdate = async (newStatus: string) => {
    if (!lead) return;
    
    await supabase
      .from("leads")
      .update({ status: newStatus })
      .eq("id", lead.id);
    
    toast.success(`Lead marcado como ${newStatus}`);
    refetch();
    closeDrawer();
  };

  const handleWhatsApp = () => {
    if (lead?.contact_phone) {
      window.open(`https://wa.me/${lead.contact_phone.replace(/\D/g, '')}`, '_blank');
    }
  };

  if (!lead) return null;

  return (
    <Sheet open={!!ui.drawerLeadId} onOpenChange={(open) => !open && closeDrawer()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl">{lead.lead_name}</SheetTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingLead(lead)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-medium">
              {lead.status}
            </Badge>
          </div>

          <div className="space-y-4">
            {lead.last_city && (
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Cidade</p>
                  <p className="text-sm text-muted-foreground">{lead.last_city}</p>
                </div>
              </div>
            )}

            {lead.email && (
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <a
                    href={`mailto:${lead.email}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {lead.email}
                  </a>
                </div>
              </div>
            )}

            {lead.contact_phone && (
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Telefone</p>
                  <p className="text-sm text-muted-foreground">{lead.contact_phone}</p>
                </div>
              </div>
            )}

            {lead.owner_name && (
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Responsável</p>
                  <p className="text-sm text-muted-foreground">{lead.owner_name}</p>
                </div>
              </div>
            )}

            {lead.source && (
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Origem</p>
                  <p className="text-sm text-muted-foreground">{lead.source}</p>
                </div>
              </div>
            )}

            {lead.value !== null && lead.value !== undefined && (
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Valor da Oportunidade</p>
                  <p className="text-sm text-muted-foreground">
                    R$ {lead.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            )}

            {lead.connection_level && (
              <div className="flex items-start gap-3">
                <Signal className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Nível de Conexão</p>
                  <Badge variant={
                    lead.connection_level === 'Alta' ? 'default' :
                    lead.connection_level === 'Média' ? 'secondary' : 'outline'
                  }>
                    {lead.connection_level}
                  </Badge>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Data de Criação</p>
                <p className="text-sm text-muted-foreground">
                  {format(parseISO(lead.created_at), "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </p>
              </div>
            </div>

            {lead.notes && (
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Observações</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{lead.notes}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleWhatsApp}
              disabled={!lead.contact_phone}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
            
            <Button 
              variant="default"
              size="sm"
              onClick={() => handleQuickUpdate('Fechado')}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Fechar Venda
            </Button>
            
            <Button 
              variant="destructive"
              size="sm"
              onClick={() => handleQuickUpdate('Perdido')}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Perdido
            </Button>
          </div>
        </div>
      </SheetContent>

      <EditLeadModal
        lead={editingLead}
        open={!!editingLead}
        onClose={() => setEditingLead(null)}
        onSuccess={() => {
          refetch();
          setEditingLead(null);
        }}
      />
    </Sheet>
  );
}
