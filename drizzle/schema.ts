import { mysqlTable, mysqlSchema, primaryKey, varchar, int, mysqlEnum, timestamp, text, decimal, json, unique, foreignKey, tinyint } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const assinaturas = mysqlTable("assinaturas", {
	id: varchar({ length: 36 }).notNull(),
	utilizadorId: int("utilizador_id").notNull(),
	produtoId: varchar("produto_id", { length: 36 }).notNull(),
	pedidoOrigemId: varchar("pedido_origem_id", { length: 36 }).notNull(),
	status: mysqlEnum(['ativa','pausada','cancelada']).default('ativa').notNull(),
	proximaCobranca: timestamp("proxima_cobranca", { mode: 'string' }).notNull(),
	criadaEm: timestamp("criada_em", { mode: 'string' }).default(sql`(now())`).notNull(),
	atualizadaEm: timestamp("atualizada_em", { mode: 'string' }).default(sql`(now())`).onUpdateNow().notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "assinaturas_id"}),
]);

export const carrinho = mysqlTable("carrinho", {
	id: varchar({ length: 36 }).notNull(),
	utilizadorId: int("utilizador_id").notNull(),
	produtoId: varchar("produto_id", { length: 36 }).notNull(),
	quantidade: int().default(1).notNull(),
	tipoCompra: mysqlEnum("tipo_compra", ['avulsa','assinatura']).default('avulsa').notNull(),
	criadoEm: timestamp("criado_em", { mode: 'string' }).default(sql`(now())`).notNull(),
	atualizadoEm: timestamp("atualizado_em", { mode: 'string' }).default(sql`(now())`).onUpdateNow().notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "carrinho_id"}),
]);

export const emailLogs = mysqlTable("email_logs", {
	id: varchar({ length: 36 }).notNull(),
	utilizadorId: int("utilizador_id").notNull(),
	pedidoId: varchar("pedido_id", { length: 36 }),
	tipo: mysqlEnum(['confirmacao_pedido','status_entrega','recomendacao','outro']).notNull(),
	destinatario: varchar({ length: 320 }).notNull(),
	assunto: text().notNull(),
	status: mysqlEnum(['enviado','falha','bounce','spam']).default('enviado').notNull(),
	erroMensagem: text("erro_mensagem"),
	criadoEm: timestamp("criado_em", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "email_logs_id"}),
]);

export const pagamentosPix = mysqlTable("pagamentos_pix", {
	id: varchar({ length: 36 }).notNull(),
	pedidoId: varchar("pedido_id", { length: 36 }).notNull(),
	utilizadorId: int("utilizador_id").notNull(),
	valor: decimal({ precision: 10, scale: 2 }).notNull(),
	chavePix: text("chave_pix").notNull(),
	qrCodeBase64: text("qr_code_base64"),
	status: mysqlEnum(['pendente','confirmado','expirado','rejeitado']).default('pendente').notNull(),
	comprovanteUrl: text("comprovante_url"),
	motivoRejeicao: text("motivo_rejeicao"),
	validadoPor: int("validado_por"),
	criadoEm: timestamp("criado_em", { mode: 'string' }).default(sql`(now())`).notNull(),
	atualizadoEm: timestamp("atualizada_em", { mode: 'string' }).default(sql`(now())`).onUpdateNow().notNull(),
	expiraEm: timestamp("expira_em", { mode: 'string' }),
},
(table) => [
	primaryKey({ columns: [table.id], name: "pagamentos_pix_id"}),
]);

export const pedidos = mysqlTable("pedidos", {
	id: varchar({ length: 36 }).notNull(),
	utilizadorId: int("utilizador_id").notNull(),
	produtoId: varchar("produto_id", { length: 36 }).notNull(),
	tipoCompra: mysqlEnum("tipo_compra", ['avulsa','assinatura']).notNull(),
	statusPagamento: mysqlEnum("status_pagamento", ['pendente','pago','cancelado','processando']).default('pendente').notNull(),
	statusEnvio: mysqlEnum("status_envio", ['preparando','enviado','entregue']).default('preparando').notNull(),
	codigoRastreio: varchar("codigo_rastreio", { length: 50 }),
	valorTotal: decimal("valor_total", { precision: 10, scale: 2 }).notNull(),
	criadoEm: timestamp("criado_em", { mode: 'string' }).default(sql`(now())`).notNull(),
	atualizadoEm: timestamp("atualizada_em", { mode: 'string' }).default(sql`(now())`).onUpdateNow().notNull(),
	freteValor: decimal("frete_valor", { precision: 10, scale: 2 }),
	enderecoRua: text("endereco_rua"),
	enderecoNumero: text("endereco_numero"),
	enderecoComplemento: text("endereco_complemento"),
	enderecoBairro: text("endereco_bairro"),
	enderecoCidade: text("endereco_cidade"),
	enderecoEstado: varchar("endereco_estado", { length: 2 }),
	enderecoCep: varchar("endereco_cep", { length: 10 }),
	assinaturaProdutoId: varchar("assinatura_produto_id", { length: 36 }),
},
(table) => [
	primaryKey({ columns: [table.id], name: "pedidos_id"}),
]);

export const perfisQuiz = mysqlTable("perfis_quiz", {
	id: varchar({ length: 36 }).notNull(),
	utilizadorId: int("utilizador_id").notNull(),
	respostasBrutas: json("respostas_brutas").notNull(),
	categoriaCalculada: text("categoria_calculada").notNull(),
	criadoEm: timestamp("criado_em", { mode: 'string' }).default(sql`(now())`).notNull(),
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
},
(table) => [
	primaryKey({ columns: [table.id], name: "perfis_quiz_id"}),
]);

export const produtos = mysqlTable("produtos", {
	id: varchar({ length: 36 }).notNull(),
	nome: text().notNull(),
	descricao: text(),
	precoAvulso: decimal("preco_avulso", { precision: 10, scale: 2 }).notNull(),
	precoAssinatura: decimal("preco_assinatura", { precision: 10, scale: 2 }),
	ativo: tinyint().default(1).notNull(),
	imagemUrl: text("imagem_url"),
	categoria: text(),
	criadoEm: timestamp("criado_em", { mode: 'string' }).default(sql`(now())`).notNull(),
	atualizadoEm: timestamp("atualizada_em", { mode: 'string' }).default(sql`(now())`).onUpdateNow().notNull(),
	assinaturaObrigatoriaId: varchar("assinatura_obrigatoria_id", { length: 36 }),
},
(table) => [
	primaryKey({ columns: [table.id], name: "produtos_id"}),
]);

export const produtosAssinaturas = mysqlTable("produtos_assinaturas", {
	id: varchar({ length: 36 }).notNull(),
	nome: varchar({ length: 50 }).notNull(),
	descricao: text(),
	preco: decimal({ precision: 10, scale: 2 }).notNull(),
	duracaoMeses: int("duracao_meses").notNull(),
	ativo: tinyint().default(1).notNull(),
	criadoEm: timestamp("criado_em", { mode: 'string' }).default(sql`(now())`).notNull(),
	atualizadoEm: timestamp("atualizada_em", { mode: 'string' }).default(sql`(now())`).onUpdateNow().notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "produtos_assinaturas_id"}),
	unique("produtos_assinaturas_nome_unique").on(table.nome),
]);

export const produtosAssinaturasPivot = mysqlTable("produtos_assinaturas_pivot", {
	produtoId: varchar("produto_id", { length: 36 }).notNull().references(() => produtos.id, { onDelete: "cascade" } ),
	assinaturaId: varchar("assinatura_id", { length: 36 }).notNull(),
	precoEspecifico: decimal("preco_especifico", { precision: 10, scale: 2 }).notNull(),
});

export const reviews = mysqlTable("reviews", {
	id: varchar({ length: 36 }).notNull(),
	utilizadorId: int("utilizador_id").notNull(),
	produtoId: varchar("produto_id", { length: 36 }).notNull(),
	pedidoId: varchar("pedido_id", { length: 36 }),
	rating: int().notNull(),
	comentario: text(),
	moderado: tinyint().default(0).notNull(),
	deletadoEm: timestamp("deletado_em", { mode: 'string' }),
	criadoEm: timestamp("criado_em", { mode: 'string' }).default(sql`(now())`).notNull(),
	atualizadoEm: timestamp("atualizada_em", { mode: 'string' }).default(sql`(now())`).onUpdateNow().notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "reviews_id"}),
]);

export const utilizadores = mysqlTable("utilizadores", {
	id: int().autoincrement().notNull(),
	openId: varchar({ length: 64 }),
	nomeCompleto: text("nome_completo"),
	email: varchar({ length: 320 }),
	telefone: varchar({ length: 20 }),
	enderecoRua: text("endereco_rua"),
	role: mysqlEnum(['cliente','admin']).default('cliente').notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).default(sql`(now())`).onUpdateNow().notNull(),
	senhaHash: text("senha_hash"),
	enderecoNumero: text("endereco_numero"),
	enderecoComplemento: text("endereco_complemento"),
	enderecoBairro: text("endereco_bairro"),
	enderecoCidade: text("endereco_cidade"),
	enderecoEstado: varchar({ length: 2 }),
	enderecoCep: varchar({ length: 10 }),
},
(table) => [
	primaryKey({ columns: [table.id], name: "utilizadores_id"}),
	unique("utilizadores_email_unique").on(table.email),
	unique("utilizadores_openId_unique").on(table.openId),
]);

export type InsertUtilizador = typeof utilizadores.$inferInsert;

export const whatsappLogs = mysqlTable("whatsapp_logs", {
	id: varchar({ length: 36 }).notNull(),
	utilizadorId: int("utilizador_id").notNull(),
	pedidoId: varchar("pedido_id", { length: 36 }),
	telefone: varchar({ length: 20 }).notNull(),
	tipo: mysqlEnum(['pagamento_pendente','pagamento_confirmado','entrega','outro']).notNull(),
	mensagem: text().notNull(),
	status: mysqlEnum(['enviado','falha','entregue','lido']).default('enviado').notNull(),
	erroMensagem: text("erro_mensagem"),
	whatsappMessageId: varchar("whatsapp_message_id", { length: 100 }),
	criadoEm: timestamp("criado_em", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "whatsapp_logs_id"}),
]);
