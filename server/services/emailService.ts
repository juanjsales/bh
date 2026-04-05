import { getDb } from "../db";
import { email_logs, pedidos, utilizadores, produtos } from "../../drizzle/schema";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";

/**
 * Serviço de Email Marketing
 * Gerencia envio de emails de confirmação, status e recomendações
 * 
 * Integração com SendGrid ou Mailgun pode ser adicionada aqui
 * Por enquanto, apenas registra logs de emails enviados
 */

interface EmailTemplate {
  assunto: string;
  corpo: string;
  tipo: "confirmacao_pedido" | "status_entrega" | "recomendacao" | "outro";
}

export const emailService = {
  /**
   * Enviar email de confirmação de pedido
   */
  async enviarConfirmacaoPedido(pedidoId: string) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Buscar pedido com dados do cliente
    const pedido = await db
      .select({
        id: pedidos.id,
        utilizador_id: pedidos.utilizador_id,
        valor_total: pedidos.valor_total,
        tipo_compra: pedidos.tipo_compra,
        criado_em: pedidos.criado_em,
        nome_completo: utilizadores.nome_completo,
        email: utilizadores.email,
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
    const template = this.gerarTemplateConfirmacao(p);

    // Registrar log de email
    const logId = uuidv4();
    await db.insert(email_logs).values({
      id: logId,
      utilizador_id: p.utilizador_id,
      pedido_id: pedidoId,
      tipo: "confirmacao_pedido",
      destinatario: p.email,
      assunto: template.assunto,
      status: "enviado",
      criado_em: new Date(),
    });

    // TODO: Integrar com SendGrid/Mailgun para envio real
    console.log(`[Email] Confirmação enviada para ${p.email}`);

    return { sucesso: true, logId };
  },

  /**
   * Enviar email de status de entrega
   */
  async enviarStatusEntrega(pedidoId: string, novoStatus: string) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Buscar pedido
    const pedido = await db
      .select({
        utilizador_id: pedidos.utilizador_id,
        email: utilizadores.email,
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
    const template = this.gerarTemplateStatus(p, novoStatus);

    // Registrar log
    const logId = uuidv4();
    await db.insert(email_logs).values({
      id: logId,
      utilizador_id: p.utilizador_id,
      pedido_id: pedidoId,
      tipo: "status_entrega",
      destinatario: p.email,
      assunto: template.assunto,
      status: "enviado",
      criado_em: new Date(),
    });

    console.log(`[Email] Status enviado para ${p.email}`);

    return { sucesso: true, logId };
  },

  /**
   * Enviar email com recomendação personalizada
   */
  async enviarRecomendacao(
    utilizadorId: number,
    produtoId: string,
    categoria: string
  ) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Buscar usuário e produto
    const usuario = await db
      .select()
      .from(utilizadores)
      .where(eq(utilizadores.id, utilizadorId))
      .limit(1) as any[];

    const produto = await db
      .select()
      .from(produtos)
      .where(eq(produtos.id, produtoId))
      .limit(1) as any[];

    if (usuario.length === 0 || produto.length === 0) {
      throw new Error("Usuário ou produto não encontrado");
    }

    const template = this.gerarTemplateRecomendacao(usuario[0], produto[0], categoria);

    // Registrar log
    const logId = uuidv4();
    await db.insert(email_logs).values({
      id: logId,
      utilizador_id: utilizadorId,
      tipo: "recomendacao",
      destinatario: usuario[0].email,
      assunto: template.assunto,
      status: "enviado",
      criado_em: new Date(),
    });

    console.log(`[Email] Recomendação enviada para ${usuario[0].email}`);

    return { sucesso: true, logId };
  },

  /**
   * Gerar template de confirmação de pedido
   */
  gerarTemplateConfirmacao(pedido: any): EmailTemplate {
    return {
      tipo: "confirmacao_pedido",
      assunto: `Pedido Confirmado - Box & Health #${pedido.id.slice(0, 8)}`,
      corpo: `
        Olá ${pedido.nome_completo},

        Seu pedido foi confirmado com sucesso!

        Detalhes do Pedido:
        - Produto: ${pedido.produto_nome}
        - Tipo: ${pedido.tipo_compra === "avulsa" ? "Compra Avulsa" : "Assinatura"}
        - Valor: R$ ${(Number(pedido.valor_total) / 100).toFixed(2)}
        - Data: ${new Date(pedido.criado_em).toLocaleDateString("pt-BR")}

        Você receberá atualizações sobre seu pedido em breve.

        Obrigado por escolher Box & Health!
      `,
    };
  },

  /**
   * Gerar template de status de entrega
   */
  gerarTemplateStatus(pedido: any, status: string): EmailTemplate {
    const statusMessages: Record<string, string> = {
      preparando: "Seu pedido está sendo preparado",
      enviado: "Seu pedido foi enviado!",
      entregue: "Seu pedido foi entregue!",
    };

    return {
      tipo: "status_entrega",
      assunto: `Atualização de Entrega - Box & Health`,
      corpo: `
        Olá ${pedido.nome_completo},

        ${statusMessages[status] || "Seu pedido foi atualizado"}

        ${pedido.codigo_rastreio ? `Código de Rastreio: ${pedido.codigo_rastreio}` : ""}

        Acompanhe seu pedido em nossa plataforma.

        Box & Health
      `,
    };
  },

  /**
   * Gerar template de recomendação
   */
  gerarTemplateRecomendacao(usuario: any, produto: any, categoria: string): EmailTemplate {
    return {
      tipo: "recomendacao",
      assunto: `Recomendação Especial para Você - Box & Health`,
      corpo: `
        Olá ${usuario.nome_completo},

        Com base em seu perfil de bem-estar, recomendamos:

        ${produto.nome}
        ${produto.descricao}

        Categoria: ${categoria}

        Confira em nossa loja!

        Box & Health
      `,
    };
  },

  /**
   * Obter histórico de emails enviados (admin)
   */
  async obterHistoricoEmails(utilizadorId?: number, limite = 50) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    let query = db.select().from(email_logs);

    if (utilizadorId) {
      query = query.where(eq(email_logs.utilizador_id, utilizadorId)) as any;
    }

    const logs = await (query as any)
      .orderBy(email_logs.criado_em)
      .limit(limite);

    return logs;
  },

  /**
   * Obter estatísticas de emails
   */
  async obterEstatisticasEmails() {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const logs = await db.select().from(email_logs);

    const stats = {
      total: logs.length,
      enviados: logs.filter((l: any) => l.status === "enviado").length,
      falhas: logs.filter((l: any) => l.status === "falha").length,
      bounces: logs.filter((l: any) => l.status === "bounce").length,
      por_tipo: {
        confirmacao_pedido: logs.filter((l: any) => l.tipo === "confirmacao_pedido").length,
        status_entrega: logs.filter((l: any) => l.tipo === "status_entrega").length,
        recomendacao: logs.filter((l: any) => l.tipo === "recomendacao").length,
      },
    };

    return stats;
  },
};
