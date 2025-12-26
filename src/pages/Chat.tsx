import { useState } from "react";
import { useLeads, Lead } from "@/hooks/useLeads";
import { useChat } from "@/hooks/useChat";
import { LeadSidebar } from "@/components/leads/LeadSidebar";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { MessageSquare } from "lucide-react";
import EditLeadModal from "@/components/modals/EditLeadModal";

export default function Chat() {
  const { leads, loading: leadsLoading, refetch } = useLeads();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const { messages, loading: messagesLoading, sendMessage } = useChat(selectedLeadId);

  const selectedLead = leads.find((l) => l.id === selectedLeadId);

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      <LeadSidebar
        leads={leads}
        selectedLeadId={selectedLeadId}
        onSelectLead={setSelectedLeadId}
        loading={leadsLoading}
      />

      <div className="flex-1 flex flex-col">
        {selectedLead ? (
          <>
            <ChatHeader 
              leadName={selectedLead.lead_name} 
              onOpenDetails={() => setEditingLead(selectedLead)}
            />
            <MessageList messages={messages} loading={messagesLoading} />
            <ChatInput onSend={sendMessage} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-semibold mb-2">Selecione uma conversa</h2>
              <p>Escolha um lead na barra lateral para começar</p>
            </div>
          </div>
        )}
      </div>

      <EditLeadModal
        lead={editingLead}
        open={!!editingLead}
        onClose={() => setEditingLead(null)}
        onSuccess={() => {
          refetch();
          setEditingLead(null);
        }}
      />
    </div>
  );
}
