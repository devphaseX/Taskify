import { timestamp } from 'drizzle-orm/pg-core';

const getDocTimestamps = (includeUpdate?: boolean) => ({
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),

  // ...(includeUpdate && { updatedAt: timestamp('updated_at').defaultNow() }),
});

export { getDocTimestamps };
