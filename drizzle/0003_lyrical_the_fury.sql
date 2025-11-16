CREATE TABLE `alerts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`plate` text NOT NULL,
	`created_at` integer NOT NULL,
	`message` text NOT NULL,
	`lat` text,
	`lng` text,
	`photo` text
);
