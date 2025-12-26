import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useLeadOperations() {
  const createLead = async (leadData: {
    name: string;
    email: string;
    contact_phone: string;
    source: string;
    last_city?: string;
    status?: string;
    value?: number;
    connection_level?: string;
    owner_id?: string;
    notes?: string;
  }) => {
    try {
      // Criar lead
      const { data: newLead, error: leadError } = await supabase
        .from('leads')
        .insert({
          name: leadData.name,
          email: leadData.email,
          contact_phone: leadData.contact_phone,
          "Fonte": leadData.source,
          last_city: leadData.last_city || null,
          status: leadData.status || 'Novo',
          owner_id: leadData.owner_id || null,
          notes: leadData.notes || null,
        })
        .select()
        .single();

      if (leadError) throw leadError;

      // Se houver valor ou conexão, criar opportunity
      if (newLead && (leadData.value || leadData.connection_level)) {
        const { error: oppError } = await supabase
          .from('opportunities')
          .insert({
            lead_id: newLead.id,
            value: leadData.value || null,
            connection_level: leadData.connection_level || null,
            status: leadData.status || 'Novo',
          });

        if (oppError) throw oppError;
      }

      toast.success("Lead criado com sucesso!");
      return { error: null };
    } catch (error: any) {
      console.error("Erro ao criar lead:", error);
      toast.error("Erro ao criar lead", {
        description: error.message
      });
      return { error };
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await supabase.rpc('rpc_update_lead_status', {
        p_lead_id: leadId,
        p_status: newStatus
      });

      if (error) throw error;

      toast.success("Status atualizado!");
      return { error: null };
    } catch (error: any) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status", {
        description: error.message
      });
      return { error };
    }
  };

  const createOpportunity = async (opportunityData: {
    lead_id: string;
    value: number;
    connection_level: string;
    status: string;
  }) => {
    try {
      const { error } = await supabase.rpc('rpc_create_opportunity', {
        p_lead_id: opportunityData.lead_id,
        p_value: opportunityData.value,
        p_connection_level: opportunityData.connection_level,
        p_status: opportunityData.status
      });

      if (error) throw error;

      toast.success("Oportunidade criada!");
      return { error: null };
    } catch (error: any) {
      console.error("Erro ao criar oportunidade:", error);
      toast.error("Erro ao criar oportunidade", {
        description: error.message
      });
      return { error };
    }
  };

  return { createLead, updateLeadStatus, createOpportunity };
}
