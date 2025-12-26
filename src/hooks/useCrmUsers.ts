import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CrmUser {
  id: string;
  auth_user_id: string;
  email: string;
  name: string | null;
  role: "NENHUM" | "VENDEDOR" | "ADMIN";
  created_at: string;
}

export function useCrmUsers() {
  const [users, setUsers] = useState<CrmUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUsers(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar usuários:", error);
      toast.error("Erro ao carregar usuários", {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: "VENDEDOR" | "ADMIN" | "NENHUM") => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      toast.success("Role atualizada com sucesso!");
      fetchUsers();
    } catch (error: any) {
      console.error("Erro ao atualizar role:", error);
      toast.error("Erro ao atualizar role", {
        description: error.message
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, updateUserRole, refetch: fetchUsers };
}