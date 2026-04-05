import { v4 as uuidv4 } from "uuid";
import { getDb } from "../db";
import { pagamentos_pix, pedidos } from "../../drizzle/schema";
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

  await db.insert(pagamentos_pix).values({
    id: pagamentoId,
    pedido_id: pedidoId,
    utilizador_id: utilizadorId,
    valor: valor.toString(),
    chave_pix: chavePix,
    qr_code_base64: dadosPix,
    expira_em: expiraEm,
  });

  return {
    id: pagamentoId,
    dadosPix,
    expiraEm,
  };
}

/**
 * Obtém pagamento PIX por ID
 */
export async function obterPagamentoPix(pagamentoId: string) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

  const pagamento = await db
    .select()
    .from(pagamentos_pix)
    .where(eq(pagamentos_pix.id, pagamentoId))
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
    .update(pagamentos_pix)
    .set({
      status: novoStatus,
      validado_por: validadoPor,
      motivo_rejeicao: motivo,
      atualizado_em: new Date(),
    })
    .where(eq(pagamentos_pix.id, pagamentoId));

  // Se aprovado, atualizar status do pedido
  if (aprovado) {
    await db
      .update(pedidos)
      .set({
        status_pagamento: "pago",
        atualizado_em: new Date(),
      })
      .where(eq(pedidos.id, pagamento.pedido_id));
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
    .from(pagamentos_pix)
    .where(eq(pagamentos_pix.status, "pendente"));
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
    .from(pagamentos_pix)
    .where(eq(pagamentos_pix.status, "pendente"));

  for (const pagamento of pagamentosVencidos) {
    if (pagamento.expira_em && new Date(pagamento.expira_em) < agora) {
      await db
        .update(pagamentos_pix)
        .set({
          status: "expirado",
          atualizado_em: new Date(),
        })
        .where(eq(pagamentos_pix.id, pagamento.id));
    }
  }

  return { expirados: pagamentosVencidos.length };
}
