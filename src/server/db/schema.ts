import { relations } from 'drizzle-orm';
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const ChallengeStore = sqliteTable('challengeStore', {
  id: text('id').notNull().primaryKey(), // Changed to text and primaryKey
  walletAddress: text('walletAddress').notNull(), // Changed to text
  issuedAt: text('issuedAt').notNull(), // Changed to text for timestamp as ISO string
  expiresAt: text('expiresAt').notNull(), // Changed to text for timestamp as ISO string
  nonce: text('nonce').notNull(), // Changed to text
});
export type InsertChallenge = typeof ChallengeStore.$inferInsert;

export const UserRounds = sqliteTable('userRounds', {
  id: text('id').notNull().primaryKey(), // Changed to text and primaryKey
  walletAddress: text('walletAddress').notNull(), // Changed to text
  roundId: text('roundId').notNull(),
  state: text({ enum: ['win', 'loss', 'blackjack'] }).notNull(),
  bet: int('bet').notNull(),
  reward: int('reward').notNull(),
});

export const userRoundsRelations = relations(UserRounds, ({ one }) => ({
  tableRounds: one(TableRounds, {
    fields: [UserRounds.roundId],
    references: [TableRounds.roundId],
  }),
}));

export const TableRounds = sqliteTable('tableRounds', {
  roundId: text('roundId').notNull().primaryKey(),
  netDealerReward: int('netDealerReward').notNull(),
  date: text('date').notNull(),
});
