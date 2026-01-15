import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

interface ChatHeaderProps {
  leadName: string;
  status: string;
  onOpenDetails?: () => void;
}

export function ChatHeader({ 
  leadName, 
  status,
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
          
          {/* Badge do Status do Funil */}
          <Badge variant="outline" className="text-xs mt-1">
            {status}
          </Badge>
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