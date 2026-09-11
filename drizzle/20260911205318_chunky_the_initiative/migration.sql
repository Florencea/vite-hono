CREATE TABLE `User` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`uid` text NOT NULL UNIQUE,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`account` text NOT NULL UNIQUE,
	`password` text NOT NULL
);
