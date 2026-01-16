import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

interface ChatHeaderProps {
  leadName: string;
  tagName?: string | null; // ✅ MUDOU: Recebe tagName ao invés de status
  instanceName?: string | null;
  onOpenDetails?: () => void;
}

export function ChatHeader({ 
  leadName, 
  tagName,
  instanceName,
  onOpenDetails 
}: ChatHeaderProps) {
  const initial = leadName.charAt(0).toUpperCase();

  return (
    <div className="border-b border-border p-4 flex items-center justify-between bg-card">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {initial}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold text-lg">{leadName}</h2>
          
          {/* ✅ MUDOU: Mostra Tag ao invés do Status do funil */}
          {tagName && (
            <Badge variant="outline" className="text-xs mt-1">
              {tagName}
            </Badge>
          )}
        </div>
      </div>

      {onOpenDetails && (
        <Button variant="ghost" size="icon" onClick={onOpenDetails}>
          <Info className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}