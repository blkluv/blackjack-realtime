import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const challengeStore = sqliteTable('challengeStore', {
  id: text('id').notNull().primaryKey(), // Changed to text and primaryKey
  walletAddress: text('walletAddress').notNull(), // Changed to text
  issuedAt: text('issuedAt').notNull(), // Changed to text for timestamp as ISO string
  expiresAt: text('expiresAt').notNull(), // Changed to text for timestamp as ISO string
  nonce: text('nonce').notNull(), // Changed to text
});

export type InsertChallenge = typeof challengeStore.$inferInsert;
