// src/services/webhookService.ts

export const sendToWebhook = async (
  phone: string, 
  message: string, 
  instanceName?: string | null
) => {
  try {
    // 1. Limpeza do telefone (Remove caracteres não numéricos)
    const cleanPhone = phone.replace(/\D/g, "");
    
    // 2. Formatação para 55 + DDD + Numero (se necessário)
    const finalNumber = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;

    const payload = {
      number: finalNumber,
      message: message,
      instance: instanceName || "default" // Adiciona a instância
    };

    // 3. Disparo (Fire & Forget)
    fetch("https://hook.rbline.com.br/webhook/envia_chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(err => console.error("Erro silencioso no webhook:", err));

    return true;
  } catch (error) {
    console.error("Erro ao preparar envio:", error);
    return false;
  }
};