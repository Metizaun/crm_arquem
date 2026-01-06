import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { ChatMessage } from "@/hooks/useChat";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MessageListProps {
  messages: ChatMessage[];
  loading: boolean;
}

export function MessageList({ messages, loading }: MessageListProps) {
  // 1. Criamos a referência para o elemento "fim do chat"
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 2. Função que rola até o elemento invisível
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 3. Sempre que as mensagens mudarem ou o loading terminar, rola para baixo
  useEffect(() => {
    // Usamos um pequeno timeout para garantir que o DOM renderizou
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [messages, loading]);

  if (loading) {
    return (
      <div className="flex-1 p-4 space-y-4">
        <Skeleton className="h-16 w-2/3" />
        <Skeleton className="h-16 w-2/3 ml-auto" />
        <Skeleton className="h-16 w-2/3" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>Nenhuma mensagem ainda</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 h-full">
      <div className="space-y-4 py-4 pl-4 pr-7">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            content={message.content}
            sentAt={message.sent_at}
            isOutbound={message.direction_code === 2}
            senderName={message.sender_name}
          />
        ))}
        
        {/* 4. O elemento invisível que serve de âncora */}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}