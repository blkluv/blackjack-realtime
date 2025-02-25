import { sql } from 'drizzle-orm';
import { UserRounds } from '../db/schema';
import { j, publicProcedure } from '../jstack';

export const leaderboardRouter = j.router({
  getLeaderboardData: publicProcedure.query(async ({ ctx, c }) => {
    try {
      // Modified query to group by walletAddress
      const leaderboardData = await ctx.db
        .select({
          walletAddress: UserRounds.walletAddress,
          netProfit: sql<number>`sum(${UserRounds.reward})`.as('netProfit'),
          totalWagered: sql<number>`sum(${UserRounds.bet})`.as('totalWagered'),
          biggestWin: sql<number>`max(${UserRounds.reward})`.as('biggestWin'),
          gamesPlayed: sql<number>`count(*)`.as('gamesPlayed'),
        })
        .from(UserRounds)
        .groupBy(UserRounds.walletAddress)
        .orderBy(sql`netProfit desc`);

      const rankedLeaderboard = leaderboardData.map((item, index) => ({
        rank: index + 1,
        walletAddress: item.walletAddress,
        netProfit: item.netProfit || 0,
        totalWagered: item.totalWagered || 0,
        biggestWin: item.biggestWin || 0,
        gamesPlayed: item.gamesPlayed || 0,
        id: index + 1,
      }));

      return c.superjson(rankedLeaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      return c.superjson({ error: 'Failed to fetch leaderboard data' }, 500);
    }
  }),
});
