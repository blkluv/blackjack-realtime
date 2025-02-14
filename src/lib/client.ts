import { env } from '@/env.mjs';
import type { AppRouter } from '@/server';
import { createClient } from 'jstack';
/**
 * Your type-safe API client
 * @see https://jstack.app/docs/backend/api-client
 */
export const client = createClient<AppRouter>({
  baseUrl: `${getBaseUrl()}/api`,
});

function getBaseUrl() {
  // 👇 In production, use the production worker
  if (env.NODE_ENV === 'production' && env.NEXT_PUBLIC_WRANGLER_URL) {
    return env.NEXT_PUBLIC_WRANGLER_URL;
  }

  // 👇 Locally, use wrangler backend
  return 'http://localhost:3000';
}
