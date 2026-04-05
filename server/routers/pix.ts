import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { criarPagamentoPix, obterPagamentoPix, validarPagamentoPix, listarPagamentosPendentes } from "../services/pixService";

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
    .query(async ({ input }) => {
      return await obterPagamentoPix(input.pagamento_id);
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
