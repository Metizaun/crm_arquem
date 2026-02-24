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
  instance_name?: string | null;
  instance_color?: string | null;
  last_tag_name: string | null;
  last_tag_urgencia: number | null;
}

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);

      // PASSO 1: Descobrir quais IDs estao ativos (view = true), com paginacao
      const PAGE_SIZE = 500;
      const visibleIdRows: Array<{ id: string | null }> = [];
      let page = 0;

      while (true) {
        const from = page * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const { data, error } = await supabase
          .from("leads")
          .select("id")
          .eq("view", true)
          .order("created_at", { ascending: false })
          .order("id", { ascending: false })
          .range(from, to);

        if (error) throw error;

        if (!data || data.length === 0) {
          break;
        }

        visibleIdRows.push(...data);

        if (data.length < PAGE_SIZE) {
          break;
        }

        page += 1;
      }

      const visibleIds = Array.from(
        new Set(
          visibleIdRows
            .map((lead) => lead.id)
            .filter((id): id is string => typeof id === "string" && id.length > 0)
        )
      );

      if (visibleIds.length === 0) {
        setLeads([]);
        return;
      }

      // PASSO 2: Buscar os detalhes em lotes para evitar URL muito grande (400)
      const chunkSize = 200;
      const allLeads: Lead[] = [];

      for (let i = 0; i < visibleIds.length; i += chunkSize) {
        const chunk = visibleIds.slice(i, i + chunkSize);
        const { data, error } = await supabase
          .from("v_lead_details")
          .select("*")
          .in("id", chunk)
          .order("last_message_at", { ascending: false, nullsFirst: false })
          .order("created_at", { ascending: false } as any);

        if (error) throw error;

        if (data?.length) {
          allLeads.push(...data);
        }
      }

      if (allLeads.length !== visibleIds.length) {
        const loadedLeadIds = new Set(allLeads.map((lead) => lead.id));
        const missingIds = visibleIds.filter((id) => !loadedLeadIds.has(id));

        console.warn("[useLeads] Divergencia entre IDs visiveis e detalhes carregados", {
          visibleIdsCount: visibleIds.length,
          loadedLeadsCount: allLeads.length,
          missingCount: missingIds.length,
          sampleMissingIds: missingIds.slice(0, 10),
        });
      }

      // Garante a ordenacao global entre os lotes
      allLeads.sort((a, b) => {
        const aHasLast = !!a.last_message_at;
        const bHasLast = !!b.last_message_at;

        if (aHasLast !== bHasLast) {
          return aHasLast ? -1 : 1;
        }

        if (a.last_message_at && b.last_message_at && a.last_message_at !== b.last_message_at) {
          return a.last_message_at > b.last_message_at ? -1 : 1;
        }

        if (a.created_at !== b.created_at) {
          return a.created_at > b.created_at ? -1 : 1;
        }

        return 0;
      });

      setLeads(allLeads);
    } catch (error: any) {
      console.error("Erro ao carregar leads:", error);
      toast.error("Erro ao carregar leads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();

    // Inscreve para atualizacoes em tempo real
    const channel = supabase
      .channel("leads-changes-sorting")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "crm",
          table: "leads",
        },
        (payload) => {
          console.log("Mudanca detectada no lead, recarregando...", payload);
          fetchLeads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLeads]);

  return { leads, loading, refetch: fetchLeads };
}
