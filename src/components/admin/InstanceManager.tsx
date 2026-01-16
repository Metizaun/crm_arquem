import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings2, Pencil, Check, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { INSTANCE_COLORS, InstanceColorKey, getInstanceBadgeStyle } from "@/lib/colors";
import { cn } from "@/lib/utils";

interface Instance {
  instancia: string;
  color: string | null;
  aces_id: number;
}

export function InstanceManager() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");

  const fetchInstances = async () => {
    try {
      setLoading(true);
      setDebugInfo("");
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setDebugInfo("Usuário não autenticado.");
        return;
      }

      console.log("🔍 Admin - Auth ID:", user.id);

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('aces_id, role')
        .eq('auth_user_id', user.id)
        .single();

      if (userError) {
        console.error("Erro ao buscar user crm:", userError);
        setDebugInfo(`Erro ao buscar dados do usuário: ${userError.message}`);
        return;
      }

      if (!userData?.aces_id) {
        console.warn("Usuário sem aces_id vinculado.");
        setDebugInfo("Seu usuário não possui um ID de organização (aces_id) vinculado.");
        return;
      }

      console.log("✅ Admin - Aces ID encontrado:", userData.aces_id);

      const { data: instanceData, error: instanceError } = await supabase
        .from('instance')
        .select('instancia, color, aces_id')
        .eq('aces_id', userData.aces_id)
        .order('instancia');

      if (instanceError) {
        console.error("Erro ao buscar instâncias:", instanceError);
        throw instanceError;
      }

      console.log("📦 Instâncias encontradas:", instanceData);
      setInstances(instanceData || []);
      
    } catch (error: any) {
      toast.error("Erro ao carregar instâncias", { description: error.message });
      setDebugInfo(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstances();
  }, []);

  const handleUpdateColor = async (instancia: string, colorKey: InstanceColorKey) => {
    try {
      setUpdatingId(instancia);
      
      setInstances(prev => prev.map(inst => 
        inst.instancia === instancia ? { ...inst, color: colorKey } : inst
      ));

      const { error } = await supabase
        .from('instance')
        .update({ color: colorKey })
        .eq('instancia', instancia);

      if (error) throw error;
      
      toast.success("Cor atualizada com sucesso");
    } catch (error: any) {
      toast.error("Erro ao salvar cor", { description: error.message });
      fetchInstances();
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 space-y-4">
        <Skeleton className="h-8 w-40 mb-4" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4 border-b border-border pb-4">
        <Settings2 className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-xl font-semibold">Gerenciar Instâncias</h2>
          <p className="text-sm text-muted-foreground">
            Personalize a identificação visual dos canais da sua empresa.
          </p>
        </div>
      </div>

      {debugInfo && (
         <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {debugInfo}
         </div>
      )}

      {instances.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg border border-dashed flex flex-col items-center gap-2">
          <span>Nenhuma instância encontrada para sua conta.</span>
          {debugInfo === "" && (
             <span className="text-xs opacity-70">(Verifique se você rodou o SQL de permissões RLS)</span>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {instances.map((instance) => (
            <div 
              key={instance.instancia}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
            >
              <div className="flex flex-col gap-1">
                <span className="font-medium text-sm">{instance.instancia}</span>
                <span className="text-xs text-muted-foreground">Aces_id: {instance.aces_id}</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Preview
                  </span>
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs font-normal border px-3 py-0.5", getInstanceBadgeStyle(instance.color))}
                  >
                    {instance.instancia}
                  </Badge>
                </div>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      {updatingId === instance.instancia ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </PopoverTrigger>
                  
                  <PopoverContent className="w-auto p-4" align="center">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none text-sm">Escolha um tema</h4>
                      <p className="text-xs text-muted-foreground">
                        Isso define a cor da etiqueta no chat.
                      </p>
                      
                      <ScrollArea className="h-[200px] pr-2">
                        <div className="grid grid-cols-4 gap-2 mt-2 p-3">
                          {Object.entries(INSTANCE_COLORS).map(([key, value]) => (
                            <button
                              key={key}
                              onClick={() => handleUpdateColor(instance.instancia, key as InstanceColorKey)}
                              className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 focus:outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                value.dot,
                                instance.color === key && "ring-2 ring-ring ring-offset-1 scale-110"
                              )}
                              title={value.label}
                            >
                              {instance.color === key && (
                                <Check className="w-4 h-4 text-white drop-shadow-md" strokeWidth={3} />
                              )}
                            </button>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}