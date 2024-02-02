import {
  PgTable,
  json,
  pgTable,
  text,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { getDocTimestamps } from './shared';

const board = pgTable('board', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: text('orgId').notNull(),
  title: varchar('title', { length: 256 }).notNull(),
  image:
    json('image').$type<{ [k in `image${string}${'url' | ''}`]: string }>(),
  ...getDocTimestamps(),
});
export { board };
