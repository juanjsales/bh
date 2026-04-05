ALTER TABLE `perfis_quiz` ADD `cliente_logradouro` text;--> statement-breakpoint
ALTER TABLE `perfis_quiz` ADD `cliente_numero` text;--> statement-breakpoint
ALTER TABLE `perfis_quiz` ADD `cliente_complemento` text;--> statement-breakpoint
ALTER TABLE `perfis_quiz` ADD `cliente_bairro` text;--> statement-breakpoint
ALTER TABLE `perfis_quiz` ADD `cliente_cidade` text;--> statement-breakpoint
ALTER TABLE `perfis_quiz` ADD `cliente_estado` varchar(2);--> statement-breakpoint
ALTER TABLE `perfis_quiz` ADD `respostas_pessoais` json;--> statement-breakpoint
ALTER TABLE `perfis_quiz` ADD `respostas_emocionais` json;