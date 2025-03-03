import { authProcedure, j } from '../jstack';

export const bjtRouter = j.router({
  getBjtTokens: authProcedure.query(async ({ ctx, c }) => {
    const { user } = ctx;
    const { address } = user;

    // TODO: Implement token fetching logic
    const tokens = {};

    return c.superjson(tokens);
  }),
});
