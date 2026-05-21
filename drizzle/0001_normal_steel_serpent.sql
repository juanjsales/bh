CREATE TABLE `produtos_assinaturas` (
	`id` varchar(36) NOT NULL,
	`nome` varchar(50) NOT NULL,
	`descricao` text,
	`preco` decimal(10,2) NOT NULL,
	`duracao_meses` int NOT NULL,
	`ativo` tinyint NOT NULL DEFAULT 1,
	`criado_em` timestamp NOT NULL DEFAULT (now()),
	`atualizada_em` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `produtos_assinaturas_id` PRIMARY KEY(`id`),
	CONSTRAINT `produtos_assinaturas_nome_unique` UNIQUE(`nome`)
);
--> statement-breakpoint
CREATE TABLE `produtos_assinaturas_pivot` (
	`produto_id` varchar(36) NOT NULL,
	`assinatura_id` varchar(36) NOT NULL,
	`preco_especifico` decimal(10,2) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `assinaturas` MODIFY COLUMN `atualizada_em` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `carrinho` MODIFY COLUMN `atualizado_em` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `pagamentos_pix` MODIFY COLUMN `atualizada_em` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `pedidos` MODIFY COLUMN `tipo_compra` enum('avulsa','assinatura') NOT NULL;--> statement-breakpoint
ALTER TABLE `pedidos` MODIFY COLUMN `atualizada_em` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `produtos` MODIFY COLUMN `ativo` tinyint NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `produtos` MODIFY COLUMN `atualizada_em` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `reviews` MODIFY COLUMN `moderado` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `reviews` MODIFY COLUMN `moderado` tinyint NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `reviews` MODIFY COLUMN `atualizada_em` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `utilizadores` MODIFY COLUMN `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `email_logs` ADD `tipo` enum('confirmacao_pedido','status_entrega','recomendacao','outro') NOT NULL;--> statement-breakpoint
ALTER TABLE `email_logs` ADD `status` enum('enviado','falha','bounce','spam') DEFAULT 'enviado' NOT NULL;--> statement-breakpoint
ALTER TABLE `pagamentos_pix` ADD `status` enum('pendente','confirmado','expirado','rejeitado') DEFAULT 'pendente' NOT NULL;--> statement-breakpoint
ALTER TABLE `pedidos` ADD `assinatura_produto_id` varchar(36);--> statement-breakpoint
ALTER TABLE `produtos` ADD `assinatura_obrigatoria_id` varchar(36);--> statement-breakpoint
ALTER TABLE `utilizadores` ADD `endereco_rua` text;--> statement-breakpoint
ALTER TABLE `utilizadores` ADD `endereco_numero` text;--> statement-breakpoint
ALTER TABLE `utilizadores` ADD `endereco_complemento` text;--> statement-breakpoint
ALTER TABLE `utilizadores` ADD `endereco_bairro` text;--> statement-breakpoint
ALTER TABLE `utilizadores` ADD `endereco_cidade` text;--> statement-breakpoint
ALTER TABLE `utilizadores` ADD `enderecoEstado` varchar(2);--> statement-breakpoint
ALTER TABLE `utilizadores` ADD `enderecoCep` varchar(10);--> statement-breakpoint
ALTER TABLE `whatsapp_logs` ADD `tipo` enum('pagamento_pendente','pagamento_confirmado','entrega','outro') NOT NULL;--> statement-breakpoint
ALTER TABLE `whatsapp_logs` ADD `status` enum('enviado','falha','entregue','lido') DEFAULT 'enviado' NOT NULL;--> statement-breakpoint
ALTER TABLE `produtos_assinaturas_pivot` ADD CONSTRAINT `produtos_assinaturas_pivot_produto_id_produtos_id_fk` FOREIGN KEY (`produto_id`) REFERENCES `produtos`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `email_logs` DROP COLUMN `tipo_email`;--> statement-breakpoint
ALTER TABLE `email_logs` DROP COLUMN `status_email`;--> statement-breakpoint
ALTER TABLE `pagamentos_pix` DROP COLUMN `status_pix`;--> statement-breakpoint
ALTER TABLE `utilizadores` DROP COLUMN `endereco_completo`;--> statement-breakpoint
ALTER TABLE `whatsapp_logs` DROP COLUMN `tipo_whatsapp`;--> statement-breakpoint
ALTER TABLE `whatsapp_logs` DROP COLUMN `status_whatsapp`;