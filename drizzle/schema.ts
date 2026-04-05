import { pgTable, varchar, integer, timestamp, text, numeric, json, boolean, unique, serial, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const role = pgEnum("role", ['cliente', 'admin'])
export const status = pgEnum("status", ['ativa', 'pausada', 'cancelada'])
export const statusEmail = pgEnum("status_email", ['enviado', 'falha', 'bounce', 'spam'])
export const statusEnvio = pgEnum("status_envio", ['preparando', 'enviado', 'entregue'])
export const statusPagamento = pgEnum("status_pagamento", ['pendente', 'pago', 'cancelado'])
export const statusPix = pgEnum("status_pix", ['pendente', 'confirmado', 'expirado', 'rejeitado'])
export const statusWhatsapp = pgEnum("status_whatsapp", ['enviado', 'falha', 'entregue', 'lido'])
export const tipoCompra = pgEnum("tipo_compra", ['avulsa', 'assinatura'])
export const tipoEmail = pgEnum("tipo_email", ['confirmacao_pedido', 'status_entrega', 'recomendacao', 'outro'])
export const tipoWhatsapp = pgEnum("tipo_whatsapp", ['pagamento_pendente', 'pagamento_confirmado', 'entrega', 'outro'])


export const assinaturas = pgTable("assinaturas", {
	id: varchar({ length: 36 }).primaryKey().notNull(),
	utilizadorId: integer("utilizador_id").notNull(),
	produtoId: varchar("produto_id", { length: 36 }).notNull(),
	pedidoOrigemId: varchar("pedido_origem_id", { length: 36 }).notNull(),
	status: status().default('ativa').notNull(),
	proximaCobranca: timestamp("proxima_cobranca", { mode: 'string' }).notNull(),
	criadaEm: timestamp("criada_em", { mode: 'string' }).defaultNow().notNull(),
	atualizadaEm: timestamp("atualizada_em", { mode: 'string' }).defaultNow().notNull(),
});

export const carrinho = pgTable("carrinho", {
	id: varchar({ length: 36 }).primaryKey().notNull(),
	utilizadorId: integer("utilizador_id").notNull(),
	produtoId: varchar("produto_id", { length: 36 }).notNull(),
	quantidade: integer().default(1).notNull(),
	tipoCompra: tipoCompra("tipo_compra").default('avulsa').notNull(),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow().notNull(),
	atualizadoEm: timestamp("atualizado_em", { mode: 'string' }).defaultNow().notNull(),
});

export const emailLogs = pgTable("email_logs", {
	id: varchar({ length: 36 }).primaryKey().notNull(),
	utilizadorId: integer("utilizador_id").notNull(),
	pedidoId: varchar("pedido_id", { length: 36 }),
	tipoEmail: tipoEmail("tipo_email").notNull(),
	destinatario: varchar({ length: 320 }).notNull(),
	assunto: text().notNull(),
	statusEmail: statusEmail("status_email").default('enviado').notNull(),
	erroMensagem: text("erro_mensagem"),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow().notNull(),
});

export const pagamentosPix = pgTable("pagamentos_pix", {
	id: varchar({ length: 36 }).primaryKey().notNull(),
	pedidoId: varchar("pedido_id", { length: 36 }).notNull(),
	utilizadorId: integer("utilizador_id").notNull(),
	valor: numeric({ precision: 10, scale:  2 }).notNull(),
	chavePix: text("chave_pix").notNull(),
	qrCodeBase64: text("qr_code_base64"),
	statusPix: statusPix("status_pix").default('pendente').notNull(),
	comprovanteUrl: text("comprovante_url"),
	motivoRejeicao: text("motivo_rejeicao"),
	validadoPor: integer("validado_por"),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow().notNull(),
	atualizadoEm: timestamp("atualizado_em", { mode: 'string' }).defaultNow().notNull(),
	expiraEm: timestamp("expira_em", { mode: 'string' }),
});

export const pedidos = pgTable("pedidos", {
	id: varchar({ length: 36 }).primaryKey().notNull(),
	utilizadorId: integer("utilizador_id").notNull(),
	produtoId: varchar("produto_id", { length: 36 }).notNull(),
	tipoCompra: tipoCompra("tipo_compra").notNull(),
	statusPagamento: statusPagamento("status_pagamento").default('pendente').notNull(),
	statusEnvio: statusEnvio("status_envio").default('preparando').notNull(),
	codigoRastreio: varchar("codigo_rastreio", { length: 50 }),
	valorTotal: numeric("valor_total", { precision: 10, scale:  2 }).notNull(),
	freteValor: numeric("frete_valor", { precision: 10, scale:  2 }),
	enderecoRua: text("endereco_rua"),
	enderecoNumero: text("endereco_numero"),
	enderecoComplemento: text("endereco_complemento"),
	enderecoBairro: text("endereco_bairro"),
	enderecoCidade: text("endereco_cidade"),
	enderecoEstado: varchar("endereco_estado", { length: 2 }),
	enderecoCep: varchar("endereco_cep", { length: 10 }),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow().notNull(),
	atualizadoEm: timestamp("atualizado_em", { mode: 'string' }).defaultNow().notNull(),
});

export const perfisQuiz = pgTable("perfis_quiz", {
	id: varchar({ length: 36 }).primaryKey().notNull(),
	utilizadorId: integer("utilizador_id").notNull(),
	respostasBrutas: json("respostas_brutas").notNull(),
	categoriaCalculada: text("categoria_calculada").notNull(),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow().notNull(),
	clienteNome: text("cliente_nome"),
	clienteEmail: varchar("cliente_email", { length: 320 }),
	clienteWhatsapp: varchar("cliente_whatsapp", { length: 20 }),
	clienteCep: varchar("cliente_cep", { length: 10 }),
	clienteLogradouro: text("cliente_logradouro"),
	clienteNumero: text("cliente_numero"),
	clienteComplemento: text("cliente_complemento"),
	clienteBairro: text("cliente_bairro"),
	clienteCidade: text("cliente_cidade"),
	clienteEstado: varchar("cliente_estado", { length: 2 }),
	respostasPessoais: json("respostas_pessoais"),
	respostasEmocionais: json("respostas_emocionais"),
});

export const produtos = pgTable("produtos", {
	id: varchar({ length: 36 }).primaryKey().notNull(),
	nome: text().notNull(),
	descricao: text(),
	precoAvulso: numeric("preco_avulso", { precision: 10, scale:  2 }).notNull(),
	precoAssinatura: numeric("preco_assinatura", { precision: 10, scale:  2 }),
	ativo: boolean().default(true).notNull(),
	imagemUrl: text("imagem_url"),
	categoria: text(),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow().notNull(),
	atualizadoEm: timestamp("atualizado_em", { mode: 'string' }).defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
	id: varchar({ length: 36 }).primaryKey().notNull(),
	utilizadorId: integer("utilizador_id").notNull(),
	produtoId: varchar("produto_id", { length: 36 }).notNull(),
	pedidoId: varchar("pedido_id", { length: 36 }),
	rating: integer().notNull(),
	comentario: text(),
	moderado: boolean().default(false).notNull(),
	deletadoEm: timestamp("deletado_em", { mode: 'string' }),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow().notNull(),
	atualizadoEm: timestamp("atualizado_em", { mode: 'string' }).defaultNow().notNull(),
});

export const utilizadores = pgTable("utilizadores", {
	id: serial().primaryKey().notNull(),
	openId: varchar({ length: 64 }),
	nomeCompleto: text("nome_completo"),
	email: varchar({ length: 320 }),
	senhaHash: text("senha_hash"),
	telefone: varchar({ length: 20 }),
	enderecoCompleto: text("endereco_completo"),
	role: role().default('cliente').notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("utilizadores_openId_unique").on(table.openId),
	unique("utilizadores_email_unique").on(table.email),
]);

export const whatsappLogs = pgTable("whatsapp_logs", {
	id: varchar({ length: 36 }).primaryKey().notNull(),
	utilizadorId: integer("utilizador_id").notNull(),
	pedidoId: varchar("pedido_id", { length: 36 }),
	telefone: varchar({ length: 20 }).notNull(),
	tipoWhatsapp: tipoWhatsapp("tipo_whatsapp").notNull(),
	mensagem: text().notNull(),
	statusWhatsapp: statusWhatsapp("status_whatsapp").default('enviado').notNull(),
	erroMensagem: text("erro_mensagem"),
	whatsappMessageId: varchar("whatsapp_message_id", { length: 100 }),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow().notNull(),
});
