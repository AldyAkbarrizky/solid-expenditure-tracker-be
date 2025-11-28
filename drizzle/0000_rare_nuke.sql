CREATE TABLE `families` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`admin_id` int NOT NULL,
	`avatar_url` text,
	`invite_code` varchar(10) NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `families_id` PRIMARY KEY(`id`),
	CONSTRAINT `families_invite_code_unique` UNIQUE(`invite_code`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN `family_id` int;
--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN `avatar_url` text;
--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_family_id_families_id_fk` FOREIGN KEY (`family_id`) REFERENCES `families`(`id`) ON DELETE set null ON UPDATE no action;