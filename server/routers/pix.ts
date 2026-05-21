import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { criarPagamentoPix, obterPagamentoPix, validarPagamentoPix, listarPagamentosPendentes } from "../services/pixService";
import { getDb } from "../db";
import { pagamentosPix, pedidos } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const pixRouter = router({
  criarPagamento: protectedProcedure
    .input(
      z.object({
        pedido_id: z.string(),
        valor: z.number().positive(),
        chave_pix: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      return await criarPagamentoPix(
        input.pedido_id,
        ctx.user.id,
        input.valor,
        input.chave_pix
      );
    }),

  obterPagamento: publicProcedure
    .input(z.object({ pagamento_id: z.string() }))
    .query(async ({ input, ctx }) => {
      console.log(`[PIX DEBUG] Buscando pagamento para ID: ${input.pagamento_id}`);
      try {
        const pag = await obterPagamentoPix(input.pagamento_id);
        console.log(`[PIX DEBUG] Pagamento encontrado diretamente pelo ID`);
        return pag;
      } catch (error: any) {
        console.log(`[PIX DEBUG] Pagamento não encontrado diretamente. Buscando por pedidoId...`);
        const db = await getDb();
        if (!db) throw error;
        
        // Em pagamentosPix o campo é pedidoId (em CamelCase no Drizzle)
        const pag = await db
          .select()
          .from(pagamentosPix)
          .where(eq(pagamentosPix.pedidoId, input.pagamento_id))
          .limit(1);
          
        if (pag.length > 0) {
          console.log(`[PIX DEBUG] Pagamento encontrado pelo pedidoId`);
          return await obterPagamentoPix(pag[0].id);
        }

        console.log(`[PIX DEBUG] Nenhum pagamento encontrado para este pedidoId. Tentando criar um novo...`);
        // Se não existir pagamento para este pedido, mas o pedido existe, criar um novo pagamento
        const pedido = await db
          .select()
          .from(pedidos)
          .where(eq(pedidos.id, input.pagamento_id))
          .limit(1);

        if (pedido.length > 0) {
          console.log(`[PIX DEBUG] Pedido encontrado: ${JSON.stringify(pedido[0], null, 2)}. Criando novo pagamento...`);
          // Busca o utilizador_id que está como string no seu log, mas o Drizzle espera number se o schema estiver correto
          const novoPagamento = await criarPagamentoPix(
            pedido[0].id,
            pedido[0].utilizadorId,
            parseFloat(pedido[0].valorTotal) + parseFloat(pedido[0].freteValor || "0"),
            "PIX_CHAVE_PADRAO_01"
          );
          
          return await obterPagamentoPix(novoPagamento.id);
        }
        
        console.log(`[PIX DEBUG] Pedido não encontrado. Retornando erro original.`);
        throw error;
      }
    }),

  validarPagamento: protectedProcedure
    .input(
      z.object({
        pagamento_id: z.string(),
        aprovado: z.boolean(),
        motivo: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user || ctx.user.role !== "admin") {
        throw new Error("Apenas admins podem validar pagamentos");
      }
      return await validarPagamentoPix(
        input.pagamento_id,
        ctx.user.id,
        input.aprovado,
        input.motivo
      );
    }),

  listarPendentes: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new Error("Apenas admins podem listar pagamentos");
    }
    return await listarPagamentosPendentes();
  }),
});
