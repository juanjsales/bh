CREATE TABLE `assinaturas` (
	`id` varchar(36) NOT NULL,
	`utilizador_id` int NOT NULL,
	`produto_id` varchar(36) NOT NULL,
	`pedido_origem_id` varchar(36) NOT NULL,
	`status` enum('ativa','pausada','cancelada') NOT NULL DEFAULT 'ativa',
	`proxima_cobranca` timestamp NOT NULL,
	`criada_em` timestamp NOT NULL DEFAULT (now()),
	`atualizada_em` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assinaturas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `carrinho` (
	`id` varchar(36) NOT NULL,
	`utilizador_id` int NOT NULL,
	`produto_id` varchar(36) NOT NULL,
	`quantidade` int NOT NULL DEFAULT 1,
	`tipo_compra` enum('avulsa','assinatura') NOT NULL DEFAULT 'avulsa',
	`criado_em` timestamp NOT NULL DEFAULT (now()),
	`atualizado_em` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `carrinho_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_logs` (
	`id` varchar(36) NOT NULL,
	`utilizador_id` int NOT NULL,
	`pedido_id` varchar(36),
	`tipo_email` enum('confirmacao_pedido','status_entrega','recomendacao','outro') NOT NULL,
	`destinatario` varchar(320) NOT NULL,
	`assunto` text NOT NULL,
	`status_email` enum('enviado','falha','bounce','spam') NOT NULL DEFAULT 'enviado',
	`erro_mensagem` text,
	`criado_em` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pagamentos_pix` (
	`id` varchar(36) NOT NULL,
	`pedido_id` varchar(36) NOT NULL,
	`utilizador_id` int NOT NULL,
	`valor` decimal(10,2) NOT NULL,
	`chave_pix` text NOT NULL,
	`qr_code_base64` text,
	`status_pix` enum('pendente','confirmado','expirado','rejeitado') NOT NULL DEFAULT 'pendente',
	`comprovante_url` text,
	`motivo_rejeicao` text,
	`validado_por` int,
	`criado_em` timestamp NOT NULL DEFAULT (now()),
	`atualizada_em` timestamp NOT NULL DEFAULT (now()),
	`expira_em` timestamp,
	CONSTRAINT `pagamentos_pix_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pedidos` (
	`id` varchar(36) NOT NULL,
	`utilizador_id` int NOT NULL,
	`produto_id` varchar(36) NOT NULL,
	`tipo_compra` enum('avulsa','assinatura') NOT NULL DEFAULT 'avulsa',
	`status_pagamento` enum('pendente','pago','cancelado') NOT NULL DEFAULT 'pendente',
	`status_envio` enum('preparando','enviado','entregue') NOT NULL DEFAULT 'preparando',
	`codigo_rastreio` varchar(50),
	`valor_total` decimal(10,2) NOT NULL,
	`frete_valor` decimal(10,2),
	`endereco_rua` text,
	`endereco_numero` text,
	`endereco_complemento` text,
	`endereco_bairro` text,
	`endereco_cidade` text,
	`endereco_estado` varchar(2),
	`endereco_cep` varchar(10),
	`criado_em` timestamp NOT NULL DEFAULT (now()),
	`atualizada_em` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pedidos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `perfis_quiz` (
	`id` varchar(36) NOT NULL,
	`utilizador_id` int NOT NULL,
	`respostas_brutas` json NOT NULL,
	`categoria_calculada` text NOT NULL,
	`criado_em` timestamp NOT NULL DEFAULT (now()),
	`cliente_nome` text,
	`cliente_email` varchar(320),
	`cliente_whatsapp` varchar(20),
	`cliente_cep` varchar(10),
	`cliente_logradouro` text,
	`cliente_numero` text,
	`cliente_complemento` text,
	`cliente_bairro` text,
	`cliente_cidade` text,
	`cliente_estado` varchar(2),
	`respostas_pessoais` json,
	`respostas_emocionais` json,
	CONSTRAINT `perfis_quiz_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `produtos` (
	`id` varchar(36) NOT NULL,
	`nome` text NOT NULL,
	`descricao` text,
	`preco_avulso` decimal(10,2) NOT NULL,
	`preco_assinatura` decimal(10,2),
	`ativo` boolean NOT NULL DEFAULT true,
	`imagem_url` text,
	`categoria` text,
	`criado_em` timestamp NOT NULL DEFAULT (now()),
	`atualizada_em` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `produtos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` varchar(36) NOT NULL,
	`utilizador_id` int NOT NULL,
	`produto_id` varchar(36) NOT NULL,
	`pedido_id` varchar(36),
	`rating` int NOT NULL,
	`comentario` text,
	`moderado` boolean NOT NULL DEFAULT false,
	`deletado_em` timestamp,
	`criado_em` timestamp NOT NULL DEFAULT (now()),
	`atualizada_em` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `utilizadores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64),
	`nome_completo` text,
	`email` varchar(320),
	`senha_hash` text,
	`telefone` varchar(20),
	`endereco_completo` text,
	`role` enum('cliente','admin') NOT NULL DEFAULT 'cliente',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `utilizadores_id` PRIMARY KEY(`id`),
	CONSTRAINT `utilizadores_openId_unique` UNIQUE(`openId`),
	CONSTRAINT `utilizadores_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `whatsapp_logs` (
	`id` varchar(36) NOT NULL,
	`utilizador_id` int NOT NULL,
	`pedido_id` varchar(36),
	`telefone` varchar(20) NOT NULL,
	`tipo_whatsapp` enum('pagamento_pendente','pagamento_confirmado','entrega','outro') NOT NULL,
	`mensagem` text NOT NULL,
	`status_whatsapp` enum('enviado','falha','entregue','lido') NOT NULL DEFAULT 'enviado',
	`erro_mensagem` text,
	`whatsapp_message_id` varchar(100),
	`criado_em` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `whatsapp_logs_id` PRIMARY KEY(`id`)
);
