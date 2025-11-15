CREATE TABLE `cars` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`plate` text NOT NULL,
	`owner_phone` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cars_plate_unique` ON `cars` (`plate`);