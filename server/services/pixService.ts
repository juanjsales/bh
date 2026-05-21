import { v4 as uuidv4 } from "uuid";
import { getDb } from "../db";
import { pagamentosPix, pedidos, produtos } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

/**
 * Gera dados PIX estáticos para QR Code
 * Formato: 00020126580014br.gov.bcb.pix...
 */
export function gerarDadosPix(chave: string, valor: number, descricao: string): string {
  // Formato simplificado de PIX estático
  // Em produção, usar biblioteca como 'brcode' ou integração com Banco Central
  const pixData = {
    chave,
    valor: valor.toFixed(2),
    descricao: descricao.substring(0, 79),
    timestamp: new Date().toISOString(),
  };
  
  // Retornar JSON que será convertido em QR Code no frontend
  return JSON.stringify(pixData);
}

/**
 * Cria um pagamento PIX pendente
 */
export async function criarPagamentoPix(
  pedidoId: string,
  utilizadorId: number,
  valor: number,
  chavePix: string
) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

  const pagamentoId = uuidv4();
  const dadosPix = gerarDadosPix(chavePix, valor, `Pedido ${pedidoId}`);
  
  // Expira em 30 minutos
  const expiraEm = new Date(Date.now() + 30 * 60 * 1000);

  await db.insert(pagamentosPix).values({
    id: pagamentoId,
    pedidoId: pedidoId,
    utilizadorId: utilizadorId,
    valor: valor.toString(),
    chavePix: chavePix,
    qrCodeBase64: dadosPix,
    expiraEm: expiraEm,
  });

  return {
    id: pagamentoId,
    dadosPix,
    expiraEm,
  };
}

/**
 * Obtém pagamento PIX por ID com detalhes do pedido e produto
 */
export async function obterPagamentoPix(pagamentoId: string) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

  const pagamento = await db
    .select({
      id: pagamentosPix.id,
      pedidoId: pagamentosPix.pedidoId,
      utilizadorId: pagamentosPix.utilizadorId,
      valor: pagamentosPix.valor,
      chavePix: pagamentosPix.chavePix,
      qrCodeBase64: pagamentosPix.qrCodeBase64,
      status: pagamentosPix.status,
      comprovanteUrl: pagamentosPix.comprovanteUrl,
      motivoRejeicao: pagamentosPix.motivoRejeicao,
      validadoPor: pagamentosPix.validadoPor,
      criadoEm: pagamentosPix.criadoEm,
      atualizadoEm: pagamentosPix.atualizadoEm,
      expiraEm: pagamentosPix.expiraEm,
      // Dados do Pedido
      pedido: {
        id: pedidos.id,
        tipoCompra: pedidos.tipoCompra,
        statusPagamento: pedidos.statusPagamento,
        valorTotal: pedidos.valorTotal,
        enderecoRua: pedidos.enderecoRua,
        enderecoNumero: pedidos.enderecoNumero,
        enderecoBairro: pedidos.enderecoBairro,
        enderecoCidade: pedidos.enderecoCidade,
        enderecoEstado: pedidos.enderecoEstado,
        enderecoCep: pedidos.enderecoCep,
      },
      // Dados do Produto
      produto: {
        id: produtos.id,
        nome: produtos.nome,
        imagemUrl: produtos.imagemUrl,
        categoria: produtos.categoria,
      }
    })
    .from(pagamentosPix)
    .innerJoin(pedidos, eq(pagamentosPix.pedidoId, pedidos.id))
    .leftJoin(produtos, eq(pedidos.produtoId, produtos.id))
    .where(eq(pagamentosPix.id, pagamentoId))
    .limit(1);

  if (pagamento.length === 0) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Pagamento não encontrado" });
  }

  return pagamento[0];
}

/**
 * Valida pagamento PIX (aprova ou rejeita)
 */
export async function validarPagamentoPix(
  pagamentoId: string,
  validadoPor: number,
  aprovado: boolean,
  motivo?: string
) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

  const pagamento = await obterPagamentoPix(pagamentoId);

  // Atualizar status do pagamento
  const novoStatus = aprovado ? "confirmado" : "rejeitado";
  await db
    .update(pagamentosPix)
    .set({
      statusPix: novoStatus,
      validadoPor: validadoPor,
      motivoRejeicao: motivo,
      atualizadoEm: new Date(),
    })
    .where(eq(pagamentosPix.id, pagamentoId));

  // Se aprovado, atualizar status do pedido
  if (aprovado) {
    await db
      .update(pedidos)
      .set({
        statusPagamento: "pago",
        atualizadoEm: new Date(),
      })
      .where(eq(pedidos.id, pagamento.pedidoId));
  }

  return { success: true, status: novoStatus };
}

/**
 * Lista pagamentos pendentes para admin validar
 */
export async function listarPagamentosPendentes() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

  return await db
    .select()
    .from(pagamentosPix)
    .where(eq(pagamentosPix.statusPix, "pendente"));
}

/**
 * Expira pagamentos que ultrapassaram o tempo limite
 */
export async function expirarPagamentosVencidos() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

  const agora = new Date();
  
  const pagamentosVencidos = await db
    .select()
    .from(pagamentosPix)
    .where(eq(pagamentosPix.statusPix, "pendente"));

  for (const pagamento of pagamentosVencidos) {
    if (pagamento.expiraEm && new Date(pagamento.expiraEm) < agora) {
      await db
        .update(pagamentosPix)
        .set({
          status: "expirado",
          atualizado_em: new Date(),
        })
        .where(eq(pagamentos_pix.id, pagamento.id));
    }
  }

  return { expirados: pagamentosVencidos.length };
}
