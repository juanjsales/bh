import { getDb } from "../db";
import { whatsapp_logs, pedidos, utilizadores, produtos } from "../../drizzle/schema";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";

/**
 * Serviço de WhatsApp Business
 * Gerencia envio de mensagens via WhatsApp Business API
 * 
 * Integração com WhatsApp Business API pode ser adicionada aqui
 * Por enquanto, apenas registra logs de mensagens
 */

interface WhatsappMensagem {
  tipo: "pagamento_pendente" | "pagamento_confirmado" | "entrega" | "outro";
  corpo: string;
  telefone: string;
}

export const whatsappService = {
  /**
   * Validar formato de telefone brasileiro
   */
  validarTelefoneBrasil(telefone: string): boolean {
    // Remove caracteres especiais
    const limpo = telefone.replace(/\D/g, "");

    // Valida formato: 55 + 11 dígitos (55 + DDD + 9 + 8 dígitos)
    return /^55\d{11}$/.test(limpo);
  },

  /**
   * Formatar telefone para padrão E.164
   */
  formatarTelefone(telefone: string): string {
    let limpo = telefone.replace(/\D/g, "");

    // Se não tem código do país, adiciona 55
    if (!limpo.startsWith("55")) {
      limpo = "55" + limpo;
    }

    return limpo;
  },

  /**
   * Enviar mensagem de pagamento pendente
   */
  async enviarPagamentoPendente(pedidoId: string) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Buscar pedido com dados do cliente
    const pedido = await db
      .select({
        id: pedidos.id,
        utilizador_id: pedidos.utilizador_id,
        valor_total: pedidos.valor_total,
        telefone: utilizadores.telefone,
        nome_completo: utilizadores.nome_completo,
        produto_nome: produtos.nome,
      })
      .from(pedidos)
      .innerJoin(utilizadores, eq(pedidos.utilizador_id, utilizadores.id))
      .innerJoin(produtos, eq(pedidos.produto_id, produtos.id))
      .where(eq(pedidos.id, pedidoId))
      .limit(1) as any[];

    if (pedido.length === 0) {
      throw new Error("Pedido não encontrado");
    }

    const p = pedido[0];

    // Validar telefone
    if (!p.telefone || !this.validarTelefoneBrasil(p.telefone)) {
      throw new Error("Telefone inválido ou não informado");
    }

    const telefoneFmt = this.formatarTelefone(p.telefone);
    const mensagem = this.gerarMensagemPagamento(p);

    // Registrar log
    const logId = uuidv4();
    await db.insert(whatsapp_logs).values({
      id: logId,
      utilizador_id: p.utilizador_id,
      pedido_id: pedidoId,
      telefone: telefoneFmt,
      tipo: "pagamento_pendente",
      mensagem: mensagem.corpo,
      status: "enviado",
      criado_em: new Date(),
    });

    // TODO: Integrar com WhatsApp Business API para envio real
    console.log(`[WhatsApp] Mensagem de pagamento enviada para ${telefoneFmt}`);

    return { sucesso: true, logId };
  },

  /**
   * Enviar mensagem de pagamento confirmado
   */
  async enviarPagamentoConfirmado(pedidoId: string) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Buscar pedido
    const pedido = await db
      .select({
        utilizador_id: pedidos.utilizador_id,
        telefone: utilizadores.telefone,
        nome_completo: utilizadores.nome_completo,
        produto_nome: produtos.nome,
      })
      .from(pedidos)
      .innerJoin(utilizadores, eq(pedidos.utilizador_id, utilizadores.id))
      .innerJoin(produtos, eq(pedidos.produto_id, produtos.id))
      .where(eq(pedidos.id, pedidoId))
      .limit(1) as any[];

    if (pedido.length === 0) {
      throw new Error("Pedido não encontrado");
    }

    const p = pedido[0];

    if (!p.telefone || !this.validarTelefoneBrasil(p.telefone)) {
      throw new Error("Telefone inválido ou não informado");
    }

    const telefoneFmt = this.formatarTelefone(p.telefone);
    const mensagem = this.gerarMensagemPagamentoConfirmado(p);

    // Registrar log
    const logId = uuidv4();
    await db.insert(whatsapp_logs).values({
      id: logId,
      utilizador_id: p.utilizador_id,
      pedido_id: pedidoId,
      telefone: telefoneFmt,
      tipo: "pagamento_confirmado",
      mensagem: mensagem.corpo,
      status: "enviado",
      criado_em: new Date(),
    });

    console.log(`[WhatsApp] Confirmação de pagamento enviada para ${telefoneFmt}`);

    return { sucesso: true, logId };
  },

  /**
   * Enviar mensagem de atualização de entrega
   */
  async enviarAtualizacaoEntrega(pedidoId: string, status: string) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Buscar pedido
    const pedido = await db
      .select({
        utilizador_id: pedidos.utilizador_id,
        telefone: utilizadores.telefone,
        nome_completo: utilizadores.nome_completo,
        codigo_rastreio: pedidos.codigo_rastreio,
      })
      .from(pedidos)
      .innerJoin(utilizadores, eq(pedidos.utilizador_id, utilizadores.id))
      .where(eq(pedidos.id, pedidoId))
      .limit(1) as any[];

    if (pedido.length === 0) {
      throw new Error("Pedido não encontrado");
    }

    const p = pedido[0];

    if (!p.telefone || !this.validarTelefoneBrasil(p.telefone)) {
      throw new Error("Telefone inválido ou não informado");
    }

    const telefoneFmt = this.formatarTelefone(p.telefone);
    const mensagem = this.gerarMensagemEntrega(p, status);

    // Registrar log
    const logId = uuidv4();
    await db.insert(whatsapp_logs).values({
      id: logId,
      utilizador_id: p.utilizador_id,
      pedido_id: pedidoId,
      telefone: telefoneFmt,
      tipo: "entrega",
      mensagem: mensagem.corpo,
      status: "enviado",
      criado_em: new Date(),
    });

    console.log(`[WhatsApp] Atualização de entrega enviada para ${telefoneFmt}`);

    return { sucesso: true, logId };
  },

  /**
   * Gerar mensagem de pagamento pendente
   */
  gerarMensagemPagamento(pedido: any): WhatsappMensagem {
    return {
      tipo: "pagamento_pendente",
      telefone: pedido.telefone,
      corpo: `Olá ${pedido.nome_completo}! 👋

Seu pedido de ${pedido.produto_nome} está pronto! 🎁

Valor: R$ ${(Number(pedido.valor_total) / 100).toFixed(2)}

Para finalizar, acesse nossa plataforma e realize o pagamento via PIX.

Qualquer dúvida, estamos aqui! 💚

Box & Health`,
    };
  },

  /**
   * Gerar mensagem de pagamento confirmado
   */
  gerarMensagemPagamentoConfirmado(pedido: any): WhatsappMensagem {
    return {
      tipo: "pagamento_confirmado",
      telefone: pedido.telefone,
      corpo: `Ótimo! Seu pagamento foi confirmado! ✅

Seu ${pedido.produto_nome} está sendo preparado com carinho especial para você.

Você receberá atualizações sobre a entrega em breve.

Obrigado por escolher Box & Health! 💚`,
    };
  },

  /**
   * Gerar mensagem de atualização de entrega
   */
  gerarMensagemEntrega(pedido: any, status: string): WhatsappMensagem {
    const statusMessages: Record<string, string> = {
      preparando: "Seu pedido está sendo preparado com muito cuidado! 📦",
      enviado: `Seu pedido foi enviado! 🚚\nCódigo de rastreio: ${pedido.codigo_rastreio || "N/A"}`,
      entregue: "Seu pedido foi entregue! 🎉\nEsperamos que você aprove! 💚",
    };

    return {
      tipo: "entrega",
      telefone: pedido.telefone,
      corpo: `${pedido.nome_completo}, temos uma novidade! 📬

${statusMessages[status] || "Seu pedido foi atualizado"}

Qualquer dúvida, é só chamar! 💬

Box & Health`,
    };
  },

  /**
   * Obter histórico de mensagens WhatsApp (admin)
   */
  async obterHistoricoWhatsapp(utilizadorId?: number, limite = 50) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    let query = db.select().from(whatsapp_logs);

    if (utilizadorId) {
      query = query.where(eq(whatsapp_logs.utilizador_id, utilizadorId)) as any;
    }

    const logs = await (query as any)
      .orderBy(whatsapp_logs.criado_em)
      .limit(limite);

    return logs;
  },

  /**
   * Obter estatísticas de WhatsApp
   */
  async obterEstatisticasWhatsapp() {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const logs = await db.select().from(whatsapp_logs);

    const stats = {
      total: logs.length,
      enviados: logs.filter((l: any) => l.status === "enviado").length,
      falhas: logs.filter((l: any) => l.status === "falha").length,
      entregues: logs.filter((l: any) => l.status === "entregue").length,
      lidos: logs.filter((l: any) => l.status === "lido").length,
      por_tipo: {
        pagamento_pendente: logs.filter((l: any) => l.tipo === "pagamento_pendente").length,
        pagamento_confirmado: logs.filter((l: any) => l.tipo === "pagamento_confirmado").length,
        entrega: logs.filter((l: any) => l.tipo === "entrega").length,
      },
    };

    return stats;
  },
};
