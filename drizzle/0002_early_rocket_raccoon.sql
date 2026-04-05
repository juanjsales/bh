CREATE TABLE `pagamentos_pix` (
	`id` varchar(36) NOT NULL,
	`pedido_id` varchar(36) NOT NULL,
	`utilizador_id` int NOT NULL,
	`valor` decimal(10,2) NOT NULL,
	`chave_pix` text NOT NULL,
	`qr_code_base64` text,
	`status` enum('pendente','confirmado','expirado','rejeitado') NOT NULL DEFAULT 'pendente',
	`comprovante_url` text,
	`motivo_rejeicao` text,
	`validado_por` int,
	`criado_em` timestamp NOT NULL DEFAULT (now()),
	`atualizado_em` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`expira_em` timestamp,
	CONSTRAINT `pagamentos_pix_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `utilizadores` MODIFY COLUMN `openId` varchar(64);--> statement-breakpoint
ALTER TABLE `utilizadores` ADD `senha_hash` text;