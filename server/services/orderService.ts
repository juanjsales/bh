/**
 * Order Service
 * Lógica de negócio para gerenciar pedidos e pagamentos
 */

import { getDb } from "../db";
import { pedidos, produtos } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { notificarNovoPedido, notificarPagamentoConfirmado } from "../notificacoes";

/**
 * Schema para criar pedido
 */
const CriarPedidoSchema = z.object({
  produto_id: z.string().uuid("ID do produto inválido"),
  tipo_compra: z.enum(["avulsa", "assinatura"]),
  valor_total: z.number().positive("Valor deve ser positivo"),
  metodo_pagamento: z.enum(["pix", "cartao", "boleto"]).optional(),
});

const EnderecoSchema = z.object({
  rua: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().max(2).optional(),
  cep: z.string().max(10).optional(),
});

const CriarPedidoSchema = z.object({
  produto_id: z.string().uuid("ID do produto inválido"),
  tipo_compra: z.enum(["avulsa", "assinatura"]),
  valor_total: z.number().positive("Valor deve ser positivo"),
  frete_valor: z.number().optional(),
  metodo_pagamento: z.enum(["pix", "cartao", "boleto"]).optional(),
  endereco: EnderecoSchema.optional(),
});

export type CriarPedidoInput = z.infer<typeof CriarPedidoSchema>;

/**
 * Schema para atualizar status do pedido
 */
const AtualizarStatusSchema = z.object({
  pedido_id: z.string().uuid("ID do pedido inválido"),
  status_pagamento: z.enum(["pendente", "pago", "cancelado"]).optional(),
  status_envio: z.enum(["preparando", "enviado", "entregue"]).optional(),
  codigo_rastreio: z.string().optional(),
});

export type AtualizarStatusInput = z.infer<typeof AtualizarStatusSchema>;

/**
 * Cria um novo pedido
 * @param utilizadorId - ID do usuário
 * @param input - Dados do pedido validados
 * @param nomeUsuario - Nome do usuário para notificação
 * @param emailUsuario - Email do usuário
 * @returns ID do pedido criado
 */
export async function criarPedido(
  utilizadorId: number,
  input: CriarPedidoInput,
  nomeUsuario: string,
  emailUsuario: string
): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Validar que o produto existe
  const produto = await db
    .select()
    .from(produtos)
    .where(eq(produtos.id, input.produto_id))
    .limit(1);

  if (produto.length === 0) {
    throw new Error("Produto não encontrado");
  }

  const pedidoId = uuidv4();

  // Criar pedido
  await db.insert(pedidos).values({
    id: pedidoId,
    utilizador_id: utilizadorId,
    produto_id: input.produto_id,
    tipo_compra: input.tipo_compra,
    valor_total: input.valor_total.toString(),
    frete_valor: input.frete_valor?.toString(),
    metodo_pagamento: input.metodo_pagamento || "pix",
    status_pagamento: "pendente",
    endereco_rua: input.endereco?.rua,
    endereco_numero: input.endereco?.numero,
    endereco_complemento: input.endereco?.complemento,
    endereco_bairro: input.endereco?.bairro,
    endereco_cidade: input.endereco?.cidade,
    endereco_estado: input.endereco?.estado,
    endereco_cep: input.endereco?.cep,
  } as any);

  // Notificar proprietário
  try {
    await notificarNovoPedido(
      pedidoId,
      nomeUsuario || emailUsuario || "Cliente",
      input.valor_total.toString(),
      produto[0].nome
    );
  } catch (error) {
    console.error("Erro ao notificar novo pedido:", error);
    // Não falhar o pedido se a notificação falhar
  }

  return pedidoId;
}

/**
 * Obtém pedidos do usuário com paginação
 * @param utilizadorId - ID do usuário
 * @param page - Número da página (começa em 1)
 * @param pageSize - Tamanho da página
 * @returns Array de pedidos
 */
export async function obterPedidosUsuario(
  utilizadorId: number,
  page: number = 1,
  pageSize: number = 10
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const offset = (page - 1) * pageSize;

  const meusPedidos = await db
    .select()
    .from(pedidos)
    .where(eq(pedidos.utilizador_id, utilizadorId))
    .limit(pageSize)
    .offset(offset);

  return meusPedidos;
}

/**
 * Obtém todos os pedidos (apenas admin)
 * @param page - Número da página
 * @param pageSize - Tamanho da página
 * @returns Array de pedidos
 */
export async function obterTodosPedidos(
  page: number = 1,
  pageSize: number = 10
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const offset = (page - 1) * pageSize;

  const todosPedidos = await db
    .select()
    .from(pedidos)
    .limit(pageSize)
    .offset(offset);

  return todosPedidos;
}

/**
 * Atualiza o status de um pedido
 * @param input - Dados para atualizar
 * @returns Sucesso
 */
export async function atualizarStatusPedido(
  input: AtualizarStatusInput
): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: Record<string, any> = {};

  if (input.status_pagamento) {
    updateData.status_pagamento = input.status_pagamento;
  }
  if (input.status_envio) {
    updateData.status_envio = input.status_envio;
  }
  if (input.codigo_rastreio) {
    updateData.codigo_rastreio = input.codigo_rastreio;
  }

  if (Object.keys(updateData).length === 0) {
    throw new Error("Nenhum campo para atualizar");
  }

  await db.update(pedidos).set(updateData).where(eq(pedidos.id, input.pedido_id));

  // Notificar se pagamento foi confirmado
  if (input.status_pagamento === "pago") {
    try {
      const pedido = await db
        .select()
        .from(pedidos)
        .where(eq(pedidos.id, input.pedido_id))
        .limit(1);
      
      if (pedido.length > 0) {
        await notificarPagamentoConfirmado(
          input.pedido_id,
          "Cliente",
          pedido[0].valor_total
        );
      }
    } catch (error) {
      console.error("Erro ao notificar pagamento confirmado:", error);
    }
  }

  return true;
}

/**
 * Valida dados de entrada para criar pedido
 * @param data - Dados não validados
 * @returns Dados validados
 */
export function validarCriarPedido(data: unknown): CriarPedidoInput {
  try {
    return CriarPedidoSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Dados do pedido inválidos: ${error.message}`);
    }
    throw new Error("Dados do pedido inválidos");
  }
}

/**
 * Valida dados de entrada para atualizar status
 * @param data - Dados não validados
 * @returns Dados validados
 */
export function validarAtualizarStatus(data: unknown): AtualizarStatusInput {
  try {
    return AtualizarStatusSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Dados de atualização de status inválidos: ${error.message}`);
    }
    throw new Error("Dados de atualização de status inválidos");
  }
}
