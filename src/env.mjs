/* eslint-disable turbo/no-undeclared-env-vars */
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    TURSO_CONNECTION_URL: z.string().min(1),
    TURSO_AUTH_TOKEN: z.string().min(1),
    CLOUDFLARE_API_TOKEN: z.string().min(1),
    CLOUDFLARE_ACCOUNT_ID: z.string().min(1),
    WRANGLER_URL: z.string().optional(),
    JWT_SECRET: z.string().min(1),
    NODE_ENV: z.enum(['development', 'production']).default('development'),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_PARTYKIT_HOST: z.string().min(1).default('localhost:1999'),
    NEXT_PUBLIC_PROJECT_ID: z.string().min(1),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    // server env vars
    TURSO_CONNECTION_URL: process.env.TURSO_CONNECTION_URL,
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
    CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
    CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
    WRANGLER_URL: process.env.WRANGLER_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    // NODE_ENV: process.env.NODE_ENV,
    // public env vars
    NEXT_PUBLIC_PARTYKIT_HOST: process.env.NEXT_PUBLIC_PARTYKIT_HOST,
    NEXT_PUBLIC_PROJECT_ID: process.env.NEXT_PUBLIC_PROJECT_ID,
  },
});
