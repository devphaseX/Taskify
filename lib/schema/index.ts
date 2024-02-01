import { PgTable, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { getDocTimestamps } from './shared';

const board = pgTable('board', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 256 }).notNull(),
  ...getDocTimestamps(),
});
export { board };
