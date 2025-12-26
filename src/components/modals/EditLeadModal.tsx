import { useState, useEffect } from "react";
import { useCrmUsers } from "@/hooks/useCrmUsers";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Lead } from "@/hooks/useLeads";
import { Trash2 } from "lucide-react"; // Importei o ícone de lixeira

interface EditLeadModalProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const STATUS_OPTIONS = [
  "Novo",
  "Atendimento",
  "Orçamento",
  "Fechado",
  "Perdido",
  "Remarketing",
];

const CONNECTION_LEVELS = ["Baixa", "Média", "Alta"];

export default function EditLeadModal({ lead, open, onClose, onSuccess }: EditLeadModalProps) {
  const { users } = useCrmUsers();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    last_city: "",
    email: "",
    contact_phone: "",
    source: "",
    status: "",
    owner_id: "",
    value: "",
    connection_level: "",
    notes: "",
  });

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.lead_name || "",
        last_city: lead.last_city || "",
        email: lead.email || "",
        contact_phone: lead.contact_phone || "",
        source: lead.source || "",
        status: lead.status || "",
        owner_id: lead.owner_id || "",
        value: lead.value?.toString() || "",
        connection_level: lead.connection_level || "",
        notes: lead.notes || "",
      });
    }
  }, [lead]);

  // NOVA FUNÇÃO: Soft Delete
  const handleDelete = async () => {
    if (!lead) return;
    
    // Confirmação simples do navegador
    if (!window.confirm("Tem certeza que deseja mover este lead para a lixeira?")) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("leads")
        .update({ view: false }) // Atualiza view para FALSE
        .eq("id", lead.id);

      if (error) throw error;

      toast.success("Lead movido para a lixeira.");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Erro ao excluir lead:", error);
      toast.error("Erro ao excluir lead");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;

    setLoading(true);

    try {
      const { error: leadError } = await supabase
        .from("leads")
        .update({
          name: formData.name,
          last_city: formData.last_city || null,
          email: formData.email,
          contact_phone: formData.contact_phone,
          "Fonte": formData.source,
          status: formData.status,
          owner_id: formData.owner_id || null,
          notes: formData.notes || null,
        })
        .eq("id", lead.id);

      if (leadError) throw leadError;

      if (formData.value || formData.connection_level) {
        const opportunityData = {
          lead_id: lead.id,
          value: formData.value ? parseFloat(formData.value) : null,
          connection_level: formData.connection_level || null,
          status: formData.status,
        };

        const { data: existingOpp } = await supabase
          .from("opportunities")
          .select("id")
          .eq("lead_id", lead.id)
          .maybeSingle();

        if (existingOpp) {
          const { error: oppError } = await supabase
            .from("opportunities")
            .update(opportunityData)
            .eq("id", existingOpp.id);
          if (oppError) throw oppError;
        } else {
          const { error: oppError } = await supabase
            .from("opportunities")
            .insert(opportunityData);
          if (oppError) throw oppError;
        }
      }

      toast.success("Lead atualizado com sucesso!");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Erro ao atualizar lead:", error);
      toast.error("Erro ao atualizar lead", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Lead</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_city">Cidade</Label>
              <Input
                id="last_city"
                value={formData.last_city}
                onChange={(e) => setFormData({ ...formData, last_city: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_phone">Telefone *</Label>
              <Input
                id="contact_phone"
                required
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                placeholder="11987654321"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Origem</Label>
              <Select
                value={formData.source}
                onValueChange={(value) => setFormData({ ...formData, source: value })}
              >
                <SelectTrigger id="source">
                  <SelectValue placeholder="Selecione a origem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                  <SelectItem value="Google Ads">Google Ads</SelectItem>
                  <SelectItem value="Indicação">Indicação</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Valor (R$)</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="connection">Nível de Conexão</Label>
              <Select
                value={formData.connection_level}
                onValueChange={(value) => setFormData({ ...formData, connection_level: value })}
              >
                <SelectTrigger id="connection">
                  <SelectValue placeholder="Selecione o nível" />
                </SelectTrigger>
                <SelectContent>
                  {CONNECTION_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner">Responsável</Label>
              <Select
                value={formData.owner_id}
                onValueChange={(value) => setFormData({ ...formData, owner_id: value })}
              >
                <SelectTrigger id="owner">
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="created_at">Data de Criação</Label>
              <Input
                id="created_at"
                value={lead?.created_at ? new Date(lead.created_at).toLocaleDateString('pt-BR') : ''}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Adicione observações sobre este lead..."
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          {/* RODAPÉ DO MODAL: Botão de Excluir à Esquerda */}
          <div className="flex justify-between items-center pt-4">
            <Button 
              type="button" 
              variant="destructive" // Botão vermelho
              onClick={handleDelete}
              className="gap-2"
              disabled={loading}
            >
              <Trash2 className="w-4 h-4" />
              Excluir Lead
            </Button>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}