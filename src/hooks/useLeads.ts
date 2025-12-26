import { useState, useEffect } from "react";
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

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('v_lead_details')
        .select('*');

      if (error) throw error;

      setLeads(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar leads:", error);
      toast.error("Erro ao carregar leads", {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();

    // Subscribe to realtime updates
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
  }, []);

  return { leads, loading, refetch: fetchLeads };
}