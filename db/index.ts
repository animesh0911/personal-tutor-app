import { env } from 'cloudflare:workers';
export function getDb() {
  if (!env.DB)
    throw new Error('The database is unavailable. Please try again shortly.');
  return env.DB as D1Database;
}
