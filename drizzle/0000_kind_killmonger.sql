CREATE TABLE `challengeStore` (
	`id` text PRIMARY KEY NOT NULL,
	`walletAddress` text NOT NULL,
	`issuedAt` text NOT NULL,
	`expiresAt` text NOT NULL,
	`nonce` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tableRounds` (
	`roundId` text PRIMARY KEY NOT NULL,
	`dealerHandArray` text NOT NULL,
	`netDealerReward` integer NOT NULL,
	`date` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `userRounds` (
	`id` text PRIMARY KEY NOT NULL,
	`walletAddress` text NOT NULL,
	`roundId` text NOT NULL,
	`handArray` text NOT NULL,
	`state` text NOT NULL,
	`bet` integer NOT NULL,
	`reward` integer NOT NULL
);
