CREATE TABLE `email_logs` (
	`id` varchar(36) NOT NULL,
	`utilizador_id` int NOT NULL,
	`pedido_id` varchar(36),
	`tipo` enum('confirmacao_pedido','status_entrega','recomendacao','outro') NOT NULL,
	`destinatario` varchar(320) NOT NULL,
	`assunto` text NOT NULL,
	`status` enum('enviado','falha','bounce','spam') NOT NULL DEFAULT 'enviado',
	`erro_mensagem` text,
	`criado_em` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_logs_id` PRIMARY KEY(`id`)
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
	`atualizado_em` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `whatsapp_logs` (
	`id` varchar(36) NOT NULL,
	`utilizador_id` int NOT NULL,
	`pedido_id` varchar(36),
	`telefone` varchar(20) NOT NULL,
	`tipo` enum('pagamento_pendente','pagamento_confirmado','entrega','outro') NOT NULL,
	`mensagem` text NOT NULL,
	`status` enum('enviado','falha','entregue','lido') NOT NULL DEFAULT 'enviado',
	`erro_mensagem` text,
	`whatsapp_message_id` varchar(100),
	`criado_em` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `whatsapp_logs_id` PRIMARY KEY(`id`)
);
