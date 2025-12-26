import { useState, KeyboardEvent, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => Promise<void>;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    // A lógica de envio está aqui. Futuramente, é aqui que o Webhook entrará em ação
    // via a prop onSend passada pelo componente pai (Chat.tsx).
    if (!message.trim() || isLoading || disabled) return;
    
    setIsLoading(true);
    try {
      await onSend(message);
      setMessage("");
      // Reseta a altura após enviar
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"; 
      }
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 10);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      // Ajuste automático de altura estilo WhatsApp
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  return (
    <div className="p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* CÁPSULA PRINCIPAL (Onde acontece a mágica do design):
         - relative: para posicionamento
         - flex items-end: para o botão ficar em baixo se o texto for grande
         - bg-muted/50: cor de fundo cinza claro (estilo zap)
         - border & rounded-3xl: borda arredondada e suave
         - focus-within:ring-1: efeito de foco na cápsula inteira quando clica no texto
      */}
      <div className="relative flex items-end gap-2 bg-muted/50 border rounded-3xl px-3 py-2 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all shadow-sm">
        
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem..."
          disabled={disabled || isLoading}
          rows={1}
          // Classes cruciais para "limpar" o estilo padrão e torná-lo transparente
          className="min-h-[24px] max-h-[150px] w-full resize-none border-0 shadow-none focus-visible:ring-0 bg-transparent py-3 px-2 text-base placeholder:text-muted-foreground/70"
        />

        {/* BOTÃO DE ENVIAR:
           - rounded-full: Totalmente redondo
           - mb-1: Pequeno ajuste para alinhar com a linha de texto base
           - transition: Animação suave de cor e tamanho
        */}
        <Button
          onClick={handleSend}
          disabled={!message.trim() || isLoading || disabled}
          size="icon"
          className={`rounded-full w-10 h-10 shrink-0 mb-1 transition-all duration-200 ${
            message.trim() 
              ? "bg-primary hover:bg-primary/90 text-primary-foreground scale-100 opacity-100" 
              : "bg-muted-foreground/20 text-muted-foreground hover:bg-muted-foreground/30 scale-90 opacity-70" // Estilo desabilitado mais sutil
          }`}
        >
          <SendHorizontal className="h-5 w-5 ml-0.5" /> {/* ml-0.5 para compensar visualmente o ícone */}
        </Button>
      </div>
      
      {/* Texto de rodapé opcional para dar um ar mais profissional */}
      <div className="text-center mt-2">
        <p className="text-[10px] text-muted-foreground opacity-50">Enter para enviar, Shift + Enter para quebrar linha</p>
      </div>
    </div>
  );
}