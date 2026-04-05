ALTER TABLE `pedidos` ADD `frete_valor` decimal(10,2);--> statement-breakpoint
ALTER TABLE `pedidos` ADD `endereco_rua` text;--> statement-breakpoint
ALTER TABLE `pedidos` ADD `endereco_numero` text;--> statement-breakpoint
ALTER TABLE `pedidos` ADD `endereco_complemento` text;--> statement-breakpoint
ALTER TABLE `pedidos` ADD `endereco_bairro` text;--> statement-breakpoint
ALTER TABLE `pedidos` ADD `endereco_cidade` text;--> statement-breakpoint
ALTER TABLE `pedidos` ADD `endereco_estado` varchar(2);--> statement-breakpoint
ALTER TABLE `pedidos` ADD `endereco_cep` varchar(10);--> statement-breakpoint
ALTER TABLE `perfis_quiz` ADD `cliente_nome` text;--> statement-breakpoint
ALTER TABLE `perfis_quiz` ADD `cliente_email` varchar(320);--> statement-breakpoint
ALTER TABLE `perfis_quiz` ADD `cliente_whatsapp` varchar(20);--> statement-breakpoint
ALTER TABLE `perfis_quiz` ADD `cliente_cep` varchar(10);