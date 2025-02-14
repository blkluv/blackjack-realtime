CREATE TABLE `challengeStore` (
	`id` text PRIMARY KEY NOT NULL,
	`walletAddress` text NOT NULL,
	`issuedAt` text NOT NULL,
	`expiresAt` text NOT NULL,
	`nonce` text NOT NULL
);
