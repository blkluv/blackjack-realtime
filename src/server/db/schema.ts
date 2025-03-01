import { relations } from 'drizzle-orm';
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const UserRounds = sqliteTable('userRounds', {
  id: text('id').notNull().primaryKey(), // Changed to text and primaryKey
  walletAddress: text('walletAddress').notNull(), // Changed to text
  roundId: text('roundId').notNull(),
  handArray: text('handArray').notNull(),
  state: text({ enum: ['win', 'loss', 'blackjack', 'push'] }).notNull(),
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
  dealerHandArray: text('dealerHandArray').notNull(),
  netDealerReward: int('netDealerReward').notNull(),
  date: text('date').notNull(),
});
