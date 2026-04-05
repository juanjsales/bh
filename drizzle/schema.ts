import {
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
} from "drizzle-orm/mysql-core";

/**
 * TABELA: utilizadores (Identidade e RBAC)
 * Armazena informações de usuários e controle de acesso
 */
export const utilizadores = mysqlTable("utilizadores", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).unique(),
  nome_completo: text("nome_completo"),
  email: varchar("email", { length: 320 }).unique(),
  senha_hash: text("senha_hash"),
  telefone: varchar("telefone", { length: 20 }),
  endereco_completo: text("endereco_completo"),
  role: mysqlEnum("role", ["cliente", "admin"]).default("cliente").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Utilizador = typeof utilizadores.$inferSelect;
export type InsertUtilizador = typeof utilizadores.$inferInsert;

/**
 * TABELA: perfis_quiz (Diagnóstico Emocional)
 * Armazena as respostas do quiz emocional e categoria calculada
 */
export const perfis_quiz = mysqlTable("perfis_quiz", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID
  utilizador_id: int("utilizador_id").notNull(),
  respostas_brutas: json("respostas_brutas").$type<Record<string, any>>().notNull(),
  categoria_calculada: text("categoria_calculada").notNull(), // Ex: 'Foco', 'Relaxamento', 'Energia'
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

export type PerfilQuiz = typeof perfis_quiz.$inferSelect;
export type InsertPerfilQuiz = typeof perfis_quiz.$inferInsert;

/**
 * TABELA: produtos (Catálogo Fixo)
 * Armazena os produtos (caixas de bem-estar)
 */
export const produtos = mysqlTable("produtos", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID
  nome: text("nome").notNull(),
  descricao: text("descricao"),
  preco_avulso: decimal("preco_avulso", { precision: 10, scale: 2 }).notNull(),
  preco_assinatura: decimal("preco_assinatura", { precision: 10, scale: 2 }),
  ativo: boolean("ativo").default(true).notNull(),
  imagem_url: text("imagem_url"), // URL da imagem no S3
  categoria: text("categoria"), // Ex: 'Foco', 'Relaxamento', 'Energia'
  criado_em: timestamp("criado_em").defaultNow().notNull(),
  atualizado_em: timestamp("atualizado_em").defaultNow().onUpdateNow().notNull(),
});

export type Produto = typeof produtos.$inferSelect;
export type InsertProduto = typeof produtos.$inferInsert;

/**
 * TABELA: pedidos (Nó Transacional Central) 🎯
 * Centro da arquitetura - rastreia todas as transações
 */
export const pedidos = mysqlTable("pedidos", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID
  utilizador_id: int("utilizador_id").notNull(),
  produto_id: varchar("produto_id", { length: 36 }).notNull(),
  tipo_compra: mysqlEnum("tipo_compra", ["avulsa", "assinatura"]).notNull(),
  status_pagamento: mysqlEnum("status_pagamento", ["pendente", "pago", "cancelado"])
    .default("pendente")
    .notNull(),
  status_envio: mysqlEnum("status_envio", ["preparando", "enviado", "entregue"])
    .default("preparando")
    .notNull(),
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
  atualizado_em: timestamp("atualizado_em").defaultNow().onUpdateNow().notNull(),
});

export type Pedido = typeof pedidos.$inferSelect;
export type InsertPedido = typeof pedidos.$inferInsert;

/**
 * TABELA: assinaturas (Motor de Recorrência)
 * Gerencia assinaturas recorrentes dos clientes
 */
export const assinaturas = mysqlTable("assinaturas", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID
  utilizador_id: int("utilizador_id").notNull(),
  produto_id: varchar("produto_id", { length: 36 }).notNull(),
  pedido_origem_id: varchar("pedido_origem_id", { length: 36 }).notNull(),
  status: mysqlEnum("status", ["ativa", "pausada", "cancelada"])
    .default("ativa")
    .notNull(),
  proxima_cobranca: timestamp("proxima_cobranca").notNull(),
  criada_em: timestamp("criada_em").defaultNow().notNull(),
  atualizada_em: timestamp("atualizada_em").defaultNow().onUpdateNow().notNull(),
});

export type Assinatura = typeof assinaturas.$inferSelect;
export type InsertAssinatura = typeof assinaturas.$inferInsert;

/**
 * TABELA: carrinho (Carrinho de Compras)
 * Armazena itens do carrinho para clientes logados
 */
export const carrinho = mysqlTable("carrinho", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID
  utilizador_id: int("utilizador_id").notNull(),
  produto_id: varchar("produto_id", { length: 36 }).notNull(),
  quantidade: int("quantidade").default(1).notNull(),
  tipo_compra: mysqlEnum("tipo_compra", ["avulsa", "assinatura"]).default("avulsa").notNull(),
  criado_em: timestamp("criado_em").defaultNow().notNull(),
  atualizado_em: timestamp("atualizado_em").defaultNow().onUpdateNow().notNull(),
});

export type CarrinhoItem = typeof carrinho.$inferSelect;
export type InsertCarrinhoItem = typeof carrinho.$inferInsert;

/**
 * TABELA: pagamentos_pix (Gerenciamento de Pagamentos PIX Manual)
 * Armazena informacoes de pagamentos PIX para validacao manual
 */
export const pagamentos_pix = mysqlTable("pagamentos_pix", {
  id: varchar("id", { length: 36 }).primaryKey(),
  pedido_id: varchar("pedido_id", { length: 36 }).notNull(),
  utilizador_id: int("utilizador_id").notNull(),
  valor: decimal("valor", { precision: 10, scale: 2 }).notNull(),
  chave_pix: text("chave_pix").notNull(),
  qr_code_base64: text("qr_code_base64"),
  status: mysqlEnum("status", ["pendente", "confirmado", "expirado", "rejeitado"])
    .default("pendente")
    .notNull(),
  comprovante_url: text("comprovante_url"),
  motivo_rejeicao: text("motivo_rejeicao"),
  validado_por: int("validado_por"),
  criado_em: timestamp("criado_em").defaultNow().notNull(),
  atualizado_em: timestamp("atualizado_em").defaultNow().onUpdateNow().notNull(),
  expira_em: timestamp("expira_em"),
});

export type PagamentoPix = typeof pagamentos_pix.$inferSelect;
export type InsertPagamentoPix = typeof pagamentos_pix.$inferInsert;

/**
 * TABELA: reviews (Avaliações de Produtos)
 * Armazena avaliações de 5 estrelas e comentários dos clientes
 */
export const reviews = mysqlTable("reviews", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID
  utilizador_id: int("utilizador_id").notNull(),
  produto_id: varchar("produto_id", { length: 36 }).notNull(),
  pedido_id: varchar("pedido_id", { length: 36 }), // Referência ao pedido para validação
  rating: int("rating").notNull(), // 1-5 estrelas
  comentario: text("comentario"),
  moderado: boolean("moderado").default(false).notNull(),
  deletado_em: timestamp("deletado_em"), // Soft delete
  criado_em: timestamp("criado_em").defaultNow().notNull(),
  atualizado_em: timestamp("atualizado_em").defaultNow().onUpdateNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

/**
 * TABELA: email_logs (Histórico de Emails Enviados)
 * Rastreia todos os emails enviados para auditoria e retry
 */
export const email_logs = mysqlTable("email_logs", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID
  utilizador_id: int("utilizador_id").notNull(),
  pedido_id: varchar("pedido_id", { length: 36 }),
  tipo: mysqlEnum("tipo", ["confirmacao_pedido", "status_entrega", "recomendacao", "outro"])
    .notNull(),
  destinatario: varchar("destinatario", { length: 320 }).notNull(),
  assunto: text("assunto").notNull(),
  status: mysqlEnum("status", ["enviado", "falha", "bounce", "spam"])
    .default("enviado")
    .notNull(),
  erro_mensagem: text("erro_mensagem"),
  criado_em: timestamp("criado_em").defaultNow().notNull(),
});

export type EmailLog = typeof email_logs.$inferSelect;
export type InsertEmailLog = typeof email_logs.$inferInsert;

/**
 * TABELA: whatsapp_logs (Histórico de Mensagens WhatsApp)
 * Rastreia todas as mensagens WhatsApp enviadas
 */
export const whatsapp_logs = mysqlTable("whatsapp_logs", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID
  utilizador_id: int("utilizador_id").notNull(),
  pedido_id: varchar("pedido_id", { length: 36 }),
  telefone: varchar("telefone", { length: 20 }).notNull(),
  tipo: mysqlEnum("tipo", ["pagamento_pendente", "pagamento_confirmado", "entrega", "outro"])
    .notNull(),
  mensagem: text("mensagem").notNull(),
  status: mysqlEnum("status", ["enviado", "falha", "entregue", "lido"])
    .default("enviado")
    .notNull(),
  erro_mensagem: text("erro_mensagem"),
  whatsapp_message_id: varchar("whatsapp_message_id", { length: 100 }),
  criado_em: timestamp("criado_em").defaultNow().notNull(),
});

export type WhatsappLog = typeof whatsapp_logs.$inferSelect;
export type InsertWhatsappLog = typeof whatsapp_logs.$inferInsert;
