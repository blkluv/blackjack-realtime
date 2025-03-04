CREATE TABLE `faucetEntries` (
	`id` text PRIMARY KEY NOT NULL,
	`walletAddress` text NOT NULL,
	`amount` integer NOT NULL,
	`date` text NOT NULL
);
