CREATE TYPE "public"."role" AS ENUM('cliente', 'admin');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('ativa', 'pausada', 'cancelada');--> statement-breakpoint
CREATE TYPE "public"."status_email" AS ENUM('enviado', 'falha', 'bounce', 'spam');--> statement-breakpoint
CREATE TYPE "public"."status_envio" AS ENUM('preparando', 'enviado', 'entregue');--> statement-breakpoint
CREATE TYPE "public"."status_pagamento" AS ENUM('pendente', 'pago', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."status_pix" AS ENUM('pendente', 'confirmado', 'expirado', 'rejeitado');--> statement-breakpoint
CREATE TYPE "public"."status_whatsapp" AS ENUM('enviado', 'falha', 'entregue', 'lido');--> statement-breakpoint
CREATE TYPE "public"."tipo_compra" AS ENUM('avulsa', 'assinatura');--> statement-breakpoint
CREATE TYPE "public"."tipo_email" AS ENUM('confirmacao_pedido', 'status_entrega', 'recomendacao', 'outro');--> statement-breakpoint
CREATE TYPE "public"."tipo_whatsapp" AS ENUM('pagamento_pendente', 'pagamento_confirmado', 'entrega', 'outro');--> statement-breakpoint
CREATE TABLE "assinaturas" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"utilizador_id" integer NOT NULL,
	"produto_id" varchar(36) NOT NULL,
	"pedido_origem_id" varchar(36) NOT NULL,
	"status" "status" DEFAULT 'ativa' NOT NULL,
	"proxima_cobranca" timestamp NOT NULL,
	"criada_em" timestamp DEFAULT now() NOT NULL,
	"atualizada_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "carrinho" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"utilizador_id" integer NOT NULL,
	"produto_id" varchar(36) NOT NULL,
	"quantidade" integer DEFAULT 1 NOT NULL,
	"tipo_compra" "tipo_compra" DEFAULT 'avulsa' NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_logs" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"utilizador_id" integer NOT NULL,
	"pedido_id" varchar(36),
	"tipo_email" "tipo_email" NOT NULL,
	"destinatario" varchar(320) NOT NULL,
	"assunto" text NOT NULL,
	"status_email" "status_email" DEFAULT 'enviado' NOT NULL,
	"erro_mensagem" text,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pagamentos_pix" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"pedido_id" varchar(36) NOT NULL,
	"utilizador_id" integer NOT NULL,
	"valor" numeric(10, 2) NOT NULL,
	"chave_pix" text NOT NULL,
	"qr_code_base64" text,
	"status_pix" "status_pix" DEFAULT 'pendente' NOT NULL,
	"comprovante_url" text,
	"motivo_rejeicao" text,
	"validado_por" integer,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL,
	"expira_em" timestamp
);
--> statement-breakpoint
CREATE TABLE "pedidos" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"utilizador_id" integer NOT NULL,
	"produto_id" varchar(36) NOT NULL,
	"tipo_compra" "tipo_compra" NOT NULL,
	"status_pagamento" "status_pagamento" DEFAULT 'pendente' NOT NULL,
	"status_envio" "status_envio" DEFAULT 'preparando' NOT NULL,
	"codigo_rastreio" varchar(50),
	"valor_total" numeric(10, 2) NOT NULL,
	"frete_valor" numeric(10, 2),
	"endereco_rua" text,
	"endereco_numero" text,
	"endereco_complemento" text,
	"endereco_bairro" text,
	"endereco_cidade" text,
	"endereco_estado" varchar(2),
	"endereco_cep" varchar(10),
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "perfis_quiz" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"utilizador_id" integer NOT NULL,
	"respostas_brutas" json NOT NULL,
	"categoria_calculada" text NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"cliente_nome" text,
	"cliente_email" varchar(320),
	"cliente_whatsapp" varchar(20),
	"cliente_cep" varchar(10),
	"cliente_logradouro" text,
	"cliente_numero" text,
	"cliente_complemento" text,
	"cliente_bairro" text,
	"cliente_cidade" text,
	"cliente_estado" varchar(2),
	"respostas_pessoais" json,
	"respostas_emocionais" json
);
--> statement-breakpoint
CREATE TABLE "produtos" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"descricao" text,
	"preco_avulso" numeric(10, 2) NOT NULL,
	"preco_assinatura" numeric(10, 2),
	"ativo" boolean DEFAULT true NOT NULL,
	"imagem_url" text,
	"categoria" text,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"utilizador_id" integer NOT NULL,
	"produto_id" varchar(36) NOT NULL,
	"pedido_id" varchar(36),
	"rating" integer NOT NULL,
	"comentario" text,
	"moderado" boolean DEFAULT false NOT NULL,
	"deletado_em" timestamp,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "utilizadores" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64),
	"nome_completo" text,
	"email" varchar(320),
	"senha_hash" text,
	"telefone" varchar(20),
	"endereco_completo" text,
	"role" "role" DEFAULT 'cliente' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "utilizadores_openId_unique" UNIQUE("openId"),
	CONSTRAINT "utilizadores_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "whatsapp_logs" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"utilizador_id" integer NOT NULL,
	"pedido_id" varchar(36),
	"telefone" varchar(20) NOT NULL,
	"tipo_whatsapp" "tipo_whatsapp" NOT NULL,
	"mensagem" text NOT NULL,
	"status_whatsapp" "status_whatsapp" DEFAULT 'enviado' NOT NULL,
	"erro_mensagem" text,
	"whatsapp_message_id" varchar(100),
	"criado_em" timestamp DEFAULT now() NOT NULL
);
