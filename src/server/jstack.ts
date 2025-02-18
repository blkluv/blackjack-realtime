import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { env as honoenv } from 'hono/adapter';
import { HTTPException } from 'hono/http-exception';
import { jstack } from 'jstack';
import type { NextApiRequest } from 'next';
import { getToken } from 'next-auth/jwt';
import * as schema from './db/schema';

interface Env {
  Bindings: {
    TURSO_CONNECTION_URL: string;
    TURSO_AUTH_TOKEN: string;
    CLOUDFLARE_API_TOKEN: string;
    CLOUDFLARE_ACCOUNT_ID: string;
    NEXT_PUBLIC_WRANGLER_URL: string;
    JWT_SECRET: string;
  };
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

  const db = drizzle(client, { schema });

  return await next({ db });
});

const authMiddleWare = j.middleware(async ({ c, next }) => {
  try {
    const authHeader = c.req.header('Authorization');
    const cookies = c.req.header('Cookie');

    if (!authHeader && !cookies) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }

    const req = c.req.raw;
    const compatReq = {
      headers: Object.fromEntries(req.headers.entries()),
      cookies: Object.fromEntries(
        (req.headers.get('cookie') || '')
          .split(';')
          .map((cookie) => cookie.trim().split('='))
          .filter(([key]) => key),
      ),
      method: req.method,
      query: Object.fromEntries(new URL(req.url).searchParams),
      body: await req
        .clone()
        .json()
        .catch(() => ({})),
    } as NextApiRequest;

    // Get the token from the request using next-auth
    const token = await getToken({
      req: compatReq,
      secret: c.env.JWT_SECRET,
    });

    if (!token || !token.name) {
      throw new HTTPException(401, { message: 'Invalid token' });
    }

    // Add the user info to the context for use in procedures
    return await next({
      user: {
        id: token.sub,
        address: token.name,
      },
    });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Internal server error' });
  }
});

/**
 * Authenticated procedures
 */
export const authProcedure = j.procedure
  .use(authMiddleWare)
  .use(databaseMiddleware);

/**
 * Public (unauthenticated) procedures
 *
 * This is the base piece you use to build new queries and mutations on your API.
 */
export const publicProcedure = j.procedure.use(databaseMiddleware);
