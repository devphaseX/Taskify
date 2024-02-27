import {
  PgTable,
  integer,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
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
  order: integer('order').notNull(),
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
  order: integer('order').notNull(),
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

export const actionEnum = pgEnum('action', ['create', 'delete', 'update']);
export const entityTypeEnum = pgEnum('entity_type', ['board', 'card', 'list']);

const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: text('org_id').notNull(),
  entityId: uuid('entity_id').notNull(),
  entityTitle: varchar('entity_title', { length: 256 }).notNull(),
  entityType: entityTypeEnum('entity_type').notNull(),
  action: actionEnum('action').notNull(),
  userId: text('user_id').notNull(),
  userImage: text('user_image'),
  userName: varchar('user_name', { length: 256 }),
  ...getDocTimestamps(),
});

export type AuditLog = typeof auditLog.$inferSelect;

const orgLimit = pgTable('org_limit', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: text('orgId').unique().notNull(),
  count: integer('count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type OrgLimit = typeof orgLimit.$inferSelect;

export { board, list, card, auditLog, orgLimit };
