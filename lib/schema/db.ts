import { parsedEnv } from '@/config/env';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './';

const client = postgres(parsedEnv.DATABASE_URL);
declare global {
  var db: ReturnType<typeof drizzle<typeof schema>>;
}

const db = global.db ?? (globalThis.db = drizzle(client, { schema }));

export { db };
