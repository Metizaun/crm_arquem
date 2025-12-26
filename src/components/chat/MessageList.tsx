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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
    <ScrollArea className="flex-1 p-4">
      <div ref={scrollRef} className="space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            content={message.content}
            sentAt={message.sent_at}
            isOutbound={message.direction_code === 2}
            senderName={message.sender_name}
          />
        ))}
      </div>
    </ScrollArea>
  );
}