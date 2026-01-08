import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { sendToWebhook } from "@/services/webhookService"; // Certifique-se que criou este arquivo

export interface ChatMessage {
  id: string;
  lead_id: string;
  content: string;
  direction: string;
  direction_code: number;
  sent_at: string;
  lead_name: string;
  sender_name: string | null;
}

export function useChat(leadId: string | null) {
  // Estas linhas abaixo são as que provavelmente sumiram:
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = async () => {
    if (!leadId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('rpc_get_chat', {
        p_lead_id: leadId
      });

      if (error) throw error;

      setMessages(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar mensagens:", error);
      toast.error("Erro ao carregar chat", {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Função ATUALIZADA com o envio para Webhook
  const sendMessage = async (content: string, leadPhone?: string) => {
    if (!leadId || !content.trim()) return;

    try {
      // 1. Dispara o Webhook (Se tiver telefone)
      if (leadPhone) {
        // Não usamos await aqui para não travar a UI (Fire & Forget)
        sendToWebhook(leadPhone, content); 
      } else {
        console.warn("Tentativa de envio sem telefone detectada.");
      }

      // 2. Salva no Banco (Procedure original)
      const { error } = await supabase.rpc('rpc_send_message', {
        p_lead_id: leadId,
        p_content: content.trim(),
        p_direction: 'outbound',
        p_conversation_id: null
      });

      if (error) throw error;

    } catch (error: any) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Erro ao enviar mensagem", {
        description: error.message
      });
    }
  };

  useEffect(() => {
    if (!leadId) {
      setMessages([]);
      return;
    }

    fetchMessages();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`chat-${leadId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'crm',
        table: 'message_history',
        filter: `lead_id=eq.${leadId}`
      }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [leadId]);

  return { messages, loading, sendMessage, refetch: fetchMessages };
}