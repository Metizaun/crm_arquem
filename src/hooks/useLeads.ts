import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Lead {
  id: string;
  lead_name: string;
  email: string | null;
  contact_phone: string | null;
  source: string | null;
  status: string;
  created_at: string;
  updated_at: string | null;
  last_message_at: string | null;
  last_city: string | null;
  last_region: string | null;
  last_country: string | null;
  lead_number: number | null;
  owner_name: string | null;
  owner_id: string | null;
  value: number | null;
  connection_level: string | null;
  opportunity_status: string | null;
  notes: string | null;
}

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);

      // PASSO 1: Descobrir quais IDs estão ativos (view = true)
      const { data: visibleIdsData, error: visibleError } = await supabase
        .from('leads')
        .select('id')
        .eq('view', true);

      if (visibleError) throw visibleError;

      const visibleIds = visibleIdsData.map(l => l.id);

      if (visibleIds.length === 0) {
        setLeads([]);
        return;
      }

      // PASSO 2: Buscar os detalhes desses IDs na VIEW (mantém a formatação correta)
      const { data, error } = await supabase
        .from('v_lead_details')
        .select('*')
        .in('id', visibleIds)
        .order('created_at', { ascending: false } as any);

      if (error) throw error;

      setLeads(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar leads:", error);
      toast.error("Erro ao carregar leads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();

    // Inscreve para atualizações em tempo real
    const channel = supabase
      .channel('leads-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'crm',
        table: 'leads'
      }, () => {
        fetchLeads();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLeads]);

  return { leads, loading, refetch: fetchLeads };
}