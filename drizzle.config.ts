import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config();
const { parsedEnv } = require('./config/env');
export default {
  schema: './lib/schema/index.ts',
  out: './lib/schema/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: parsedEnv.DATABASE_URL,
  },
} satisfies Config;
