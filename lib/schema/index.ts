import {
  PgTable,
  json,
  pgTable,
  serial,
  text,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { getDocTimestamps } from './shared';
import { relations } from 'drizzle-orm';

const board = pgTable('board', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: text('orgId').notNull(),
  title: varchar('title', { length: 256 }).notNull(),
  image:
    json('image').$type<{ [k in `image${string}${'url' | ''}`]: string }>(),
  ...getDocTimestamps(),
});

export const boardRelations = relations(board, ({ many }) => ({
  lists: many(list),
}));

export type Board = typeof board.$inferSelect;

const list = pgTable('list', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 256 }).notNull(),
  order: serial('order').notNull(),
  boardId: uuid('board_id')
    .references(() => board.id, { onDelete: 'cascade' })
    .notNull(),
  ...getDocTimestamps(),
});

export const listRelations = relations(list, ({ one, many }) => ({
  board: one(board, { fields: [list.boardId], references: [board.id] }),
  cards: many(card),
}));
export type List = typeof list.$inferSelect;

const card = pgTable('card', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 256 }).notNull(),
  order: serial('order').notNull(),
  description: text('description'),
  listId: uuid('list_id')
    .references(() => list.id, { onDelete: 'cascade' })
    .notNull(),
  ...getDocTimestamps(),
});

export const cardRelations = relations(card, ({ one }) => ({
  list: one(list, { fields: [card.listId], references: [list.id] }),
}));

export type Card = typeof card.$inferSelect;

export { board, list, card };
