import type { env } from '@/env.mjs';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { env as honoenv } from 'hono/adapter';
import { jstack } from 'jstack';

interface Env {
  Bindings: typeof env;
}

export const j = jstack.init<Env>();

/**
 * Type-safely injects database into all procedures
 *
 * @see https://jstack.app/docs/backend/middleware
 */
const databaseMiddleware = j.middleware(async ({ c, next }) => {
  const { TURSO_CONNECTION_URL, TURSO_AUTH_TOKEN } = honoenv(c);

  const client = createClient({
    url: TURSO_CONNECTION_URL,
    authToken: TURSO_AUTH_TOKEN,
  });
  const db = drizzle(client);

  return await next({ db });
});

/**
 * Public (unauthenticated) procedures
 *
 * This is the base piece you use to build new queries and mutations on your API.
 */
export const publicProcedure = j.procedure.use(databaseMiddleware);
