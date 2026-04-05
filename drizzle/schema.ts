import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  timestamp,
  json,
  decimal,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

// Enums
export const roleEnum = pgEnum("role", ["cliente", "admin"]);
export const tipoCompraEnum = pgEnum("tipo_compra", ["avulsa", "assinatura"]);
export const statusPagamentoEnum = pgEnum("status_pagamento", ["pendente", "pago", "cancelado"]);
export const statusEnvioEnum = pgEnum("status_envio", ["preparando", "enviado", "entregue"]);
export const statusAssinaturaEnum = pgEnum("status", ["ativa", "pausada", "cancelada"]);
export const statusPixEnum = pgEnum("status_pix", ["pendente", "confirmado", "expirado", "rejeitado"]);
export const tipoEmailEnum = pgEnum("tipo_email", ["confirmacao_pedido", "status_entrega", "recomendacao", "outro"]);
export const statusEmailEnum = pgEnum("status_email", ["enviado", "falha", "bounce", "spam"]);
export const tipoWhatsappEnum = pgEnum("tipo_whatsapp", ["pagamento_pendente", "pagamento_confirmado", "entrega", "outro"]);
export const statusWhatsappEnum = pgEnum("status_whatsapp", ["enviado", "falha", "entregue", "lido"]);

/**
 * TABELA: utilizadores (Identidade e RBAC)
 */
export const utilizadores = pgTable("utilizadores", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).unique(),
  nome_completo: text("nome_completo"),
  email: varchar("email", { length: 320 }).unique(),
  senha_hash: text("senha_hash"),
  telefone: varchar("telefone", { length: 20 }),
  endereco_completo: text("endereco_completo"),
  role: roleEnum("role").default("cliente").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Utilizador = typeof utilizadores.$inferSelect;
export type InsertUtilizador = typeof utilizadores.$inferInsert;

/**
 * TABELA: perfis_quiz (Diagnóstico Emocional)
 */
export const perfis_quiz = pgTable("perfis_quiz", {
  id: varchar("id", { length: 36 }).primaryKey(),
  utilizador_id: integer("utilizador_id").notNull(),
  respostas_brutas: json("respostas_brutas").$type<Record<string, any>>().notNull(),
  categoria_calculada: text("categoria_calculada").notNull(),
  criado_em: timestamp("criado_em").defaultNow().notNull(),
  cliente_nome: text("cliente_nome"),
  cliente_email: varchar("cliente_email", { length: 320 }),
  cliente_whatsapp: varchar("cliente_whatsapp", { length: 20 }),
  cliente_cep: varchar("cliente_cep", { length: 10 }),
  cliente_logradouro: text("cliente_logradouro"),
  cliente_numero: text("cliente_numero"),
  cliente_complemento: text("cliente_complemento"),
  cliente_bairro: text("cliente_bairro"),
  cliente_cidade: text("cliente_cidade"),
  cliente_estado: varchar("cliente_estado", { length: 2 }),
  respostas_pessoais: json("respostas_pessoais").$type<Record<string, any>>(),
  respostas_emocionais: json("respostas_emocionais").$type<Record<string, any>>(),
});

/**
 * TABELA: produtos (Catálogo Fixo)
 */
export const produtos = pgTable("produtos", {
  id: varchar("id", { length: 36 }).primaryKey(),
  nome: text("nome").notNull(),
  descricao: text("descricao"),
  preco_avulso: decimal("preco_avulso", { precision: 10, scale: 2 }).notNull(),
  preco_assinatura: decimal("preco_assinatura", { precision: 10, scale: 2 }),
  ativo: boolean("ativo").default(true).notNull(),
  imagem_url: text("imagem_url"),
  categoria: text("categoria"),
  criado_em: timestamp("criado_em").defaultNow().notNull(),
  atualizado_em: timestamp("atualizado_em").defaultNow().notNull(),
});

/**
 * TABELA: pedidos (Nó Transacional Central) 🎯
 */
export const pedidos = pgTable("pedidos", {
  id: varchar("id", { length: 36 }).primaryKey(),
  utilizador_id: integer("utilizador_id").notNull(),
  produto_id: varchar("produto_id", { length: 36 }).notNull(),
  tipo_compra: tipoCompraEnum("tipo_compra").notNull(),
  status_pagamento: statusPagamentoEnum("status_pagamento").default("pendente").notNull(),
  status_envio: statusEnvioEnum("status_envio").default("preparando").notNull(),
  codigo_rastreio: varchar("codigo_rastreio", { length: 50 }),
  valor_total: decimal("valor_total", { precision: 10, scale: 2 }).notNull(),
  frete_valor: decimal("frete_valor", { precision: 10, scale: 2 }),
  endereco_rua: text("endereco_rua"),
  endereco_numero: text("endereco_numero"),
  endereco_complemento: text("endereco_complemento"),
  endereco_bairro: text("endereco_bairro"),
  endereco_cidade: text("endereco_cidade"),
  endereco_estado: varchar("endereco_estado", { length: 2 }),
  endereco_cep: varchar("endereco_cep", { length: 10 }),
  criado_em: timestamp("criado_em").defaultNow().notNull(),
  atualizado_em: timestamp("atualizado_em").defaultNow().notNull(),
});

/**
 * TABELA: assinaturas (Motor de Recorrência)
 */
export const assinaturas = pgTable("assinaturas", {
  id: varchar("id", { length: 36 }).primaryKey(),
  utilizador_id: integer("utilizador_id").notNull(),
  produto_id: varchar("produto_id", { length: 36 }).notNull(),
  pedido_origem_id: varchar("pedido_origem_id", { length: 36 }).notNull(),
  status: statusAssinaturaEnum("status").default("ativa").notNull(),
  proxima_cobranca: timestamp("proxima_cobranca").notNull(),
  criada_em: timestamp("criada_em").defaultNow().notNull(),
  atualizada_em: timestamp("atualizada_em").defaultNow().notNull(),
});

/**
 * TABELA: carrinho (Carrinho de Compras)
 */
export const carrinho = pgTable("carrinho", {
  id: varchar("id", { length: 36 }).primaryKey(),
  utilizador_id: integer("utilizador_id").notNull(),
  produto_id: varchar("produto_id", { length: 36 }).notNull(),
  quantidade: integer("quantidade").default(1).notNull(),
  tipo_compra: tipoCompraEnum("tipo_compra").default("avulsa").notNull(),
  criado_em: timestamp("criado_em").defaultNow().notNull(),
  atualizado_em: timestamp("atualizado_em").defaultNow().notNull(),
});

/**
 * TABELA: pagamentos_pix
 */
export const pagamentos_pix = pgTable("pagamentos_pix", {
  id: varchar("id", { length: 36 }).primaryKey(),
  pedido_id: varchar("pedido_id", { length: 36 }).notNull(),
  utilizador_id: integer("utilizador_id").notNull(),
  valor: decimal("valor", { precision: 10, scale: 2 }).notNull(),
  chave_pix: text("chave_pix").notNull(),
  qr_code_base64: text("qr_code_base64"),
  status: statusPixEnum("status_pix").default("pendente").notNull(),
  comprovante_url: text("comprovante_url"),
  motivo_rejeicao: text("motivo_rejeicao"),
  validado_por: integer("validado_por"),
  criado_em: timestamp("criado_em").defaultNow().notNull(),
  atualizado_em: timestamp("atualizado_em").defaultNow().notNull(),
  expira_em: timestamp("expira_em"),
});

/**
 * TABELA: reviews
 */
export const reviews = pgTable("reviews", {
  id: varchar("id", { length: 36 }).primaryKey(),
  utilizador_id: integer("utilizador_id").notNull(),
  produto_id: varchar("produto_id", { length: 36 }).notNull(),
  pedido_id: varchar("pedido_id", { length: 36 }),
  rating: integer("rating").notNull(),
  comentario: text("comentario"),
  moderado: boolean("moderado").default(false).notNull(),
  deletado_em: timestamp("deletado_em"),
  criado_em: timestamp("criado_em").defaultNow().notNull(),
  atualizado_em: timestamp("atualizado_em").defaultNow().notNull(),
});

/**
 * TABELA: email_logs
 */
export const email_logs = pgTable("email_logs", {
  id: varchar("id", { length: 36 }).primaryKey(),
  utilizador_id: integer("utilizador_id").notNull(),
  pedido_id: varchar("pedido_id", { length: 36 }),
  tipo: tipoEmailEnum("tipo_email").notNull(),
  destinatario: varchar("destinatario", { length: 320 }).notNull(),
  assunto: text("assunto").notNull(),
  status: statusEmailEnum("status_email").default("enviado").notNull(),
  erro_mensagem: text("erro_mensagem"),
  criado_em: timestamp("criado_em").defaultNow().notNull(),
});

/**
 * TABELA: whatsapp_logs
 */
export const whatsapp_logs = pgTable("whatsapp_logs", {
  id: varchar("id", { length: 36 }).primaryKey(),
  utilizador_id: integer("utilizador_id").notNull(),
  pedido_id: varchar("pedido_id", { length: 36 }),
  telefone: varchar("telefone", { length: 20 }).notNull(),
  tipo: tipoWhatsappEnum("tipo_whatsapp").notNull(),
  mensagem: text("mensagem").notNull(),
  status: statusWhatsappEnum("status_whatsapp").default("enviado").notNull(),
  erro_mensagem: text("erro_mensagem"),
  whatsapp_message_id: varchar("whatsapp_message_id", { length: 100 }),
  criado_em: timestamp("criado_em").defaultNow().notNull(),
});
