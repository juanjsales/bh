import { notifyOwner } from "./_core/notification";

export async function notificarNovoPedido(pedidoId: string, usuarioNome: string, valorTotal: string, produtoNome: string) {
  try {
    await notifyOwner({
      title: "🎉 Novo Pedido Recebido!",
      content: `
Cliente: ${usuarioNome}
Pedido ID: ${pedidoId}
Produto: ${produtoNome}
Valor: R$ ${valorTotal}

Status: Aguardando confirmação de pagamento PIX.
      `.trim(),
    });
  } catch (error) {
    console.error("Erro ao notificar proprietário sobre novo pedido:", error);
  }
}

export async function notificarPagamentoConfirmado(pedidoId: string, usuarioNome: string, valorTotal: string) {
  try {
    await notifyOwner({
      title: "✅ Pagamento Confirmado!",
      content: `
Cliente: ${usuarioNome}
Pedido ID: ${pedidoId}
Valor: R$ ${valorTotal}

Status: Pagamento confirmado. Proceda com o envio.
      `.trim(),
    });
  } catch (error) {
    console.error("Erro ao notificar proprietário sobre pagamento:", error);
  }
}

export async function notificarStatusAssinatura(usuarioNome: string, produtoNome: string, novoStatus: string) {
  try {
    await notifyOwner({
      title: "📋 Atualização de Assinatura",
      content: `
Cliente: ${usuarioNome}
Produto: ${produtoNome}
Novo Status: ${novoStatus}

Verifique o painel admin para mais detalhes.
      `.trim(),
    });
  } catch (error) {
    console.error("Erro ao notificar proprietário sobre assinatura:", error);
  }
}
