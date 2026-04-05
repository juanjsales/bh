CREATE TABLE `assinaturas` (
	`id` varchar(36) NOT NULL,
	`utilizador_id` int NOT NULL,
	`produto_id` varchar(36) NOT NULL,
	`pedido_origem_id` varchar(36) NOT NULL,
	`status` enum('ativa','pausada','cancelada') NOT NULL DEFAULT 'ativa',
	`proxima_cobranca` timestamp NOT NULL,
	`criada_em` timestamp NOT NULL DEFAULT (now()),
	`atualizada_em` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
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
	`atualizado_em` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `carrinho_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pedidos` (
	`id` varchar(36) NOT NULL,
	`utilizador_id` int NOT NULL,
	`produto_id` varchar(36) NOT NULL,
	`tipo_compra` enum('avulsa','assinatura') NOT NULL,
	`status_pagamento` enum('pendente','pago','cancelado') NOT NULL DEFAULT 'pendente',
	`status_envio` enum('preparando','enviado','entregue') NOT NULL DEFAULT 'preparando',
	`codigo_rastreio` varchar(50),
	`valor_total` decimal(10,2) NOT NULL,
	`criado_em` timestamp NOT NULL DEFAULT (now()),
	`atualizado_em` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pedidos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `perfis_quiz` (
	`id` varchar(36) NOT NULL,
	`utilizador_id` int NOT NULL,
	`respostas_brutas` json NOT NULL,
	`categoria_calculada` text NOT NULL,
	`criado_em` timestamp NOT NULL DEFAULT (now()),
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
	`atualizado_em` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `produtos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `utilizadores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`nome_completo` text,
	`email` varchar(320),
	`telefone` varchar(20),
	`endereco_completo` text,
	`role` enum('cliente','admin') NOT NULL DEFAULT 'cliente',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `utilizadores_id` PRIMARY KEY(`id`),
	CONSTRAINT `utilizadores_openId_unique` UNIQUE(`openId`),
	CONSTRAINT `utilizadores_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
DROP TABLE `users`;