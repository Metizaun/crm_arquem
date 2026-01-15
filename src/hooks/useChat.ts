import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { sendToWebhook } from "@/services/webhookService";

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

  const sendMessage = async (content: string, leadPhone?: string, instanceName?: string | null) => {
    if (!leadId || !content.trim()) return;

    // Cria mensagem temporária (aparece instantaneamente)
    const tempMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      lead_id: leadId,
      content: content.trim(),
      direction: 'outbound',
      direction_code: 2,
      sent_at: new Date().toISOString(),
      lead_name: '',
      sender_name: 'Você'
    };

    // Adiciona mensagem localmente
    setMessages(prev => [...prev, tempMessage]);

    try {
      // 1. Dispara o Webhook
      if (leadPhone) {
        sendToWebhook(leadPhone, content, instanceName); 
      } else {
        console.warn("Tentativa de envio sem telefone detectada.");
      }

      // 2. Salva no Banco (✅ AGORA PASSA A INSTÂNCIA)
      const { error } = await supabase.rpc('rpc_send_message', {
        p_lead_id: leadId,
        p_content: content.trim(),
        p_direction: 'outbound',
        p_conversation_id: null,
        p_instance: instanceName || null  // ✅ ADICIONADO
      });

      if (error) throw error;

      // Aguarda um pouco e substitui a mensagem temp pela real
      setTimeout(async () => {
        const { data } = await supabase.rpc('rpc_get_chat', {
          p_lead_id: leadId
        });
        
        if (data) {
          setMessages(data);
        }
      }, 500);

    } catch (error: any) {
      // Remove mensagem temporária em caso de erro
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      
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

    // Subscribe to realtime updates (para mensagens do lead)
    const channel = supabase
      .channel(`chat-${leadId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'crm',
        table: 'message_history',
        filter: `lead_id=eq.${leadId}`
      }, async (payload) => {
        console.log('🔔 Realtime detectou nova mensagem:', payload);
        
        // Verifica se é uma mensagem inbound (do lead)
        const newMsg = payload.new as any;
        
        if (newMsg.direction === 'inbound') {
          // É mensagem do lead, busca e adiciona
          const { data } = await supabase.rpc('rpc_get_chat', {
            p_lead_id: leadId
          });
          
          if (data) {
            setMessages(data);
          }
        }
        // Se for outbound, ignora (já foi tratado pelo sendMessage)
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [leadId]);

  return { messages, loading, sendMessage, refetch: fetchMessages };
}