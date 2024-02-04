'use server';

import { serverAction } from '@/lib/action';
import { board, card, list } from '@/lib/schema';
import { SelectResultFields, jsonAggBuildObject } from '@/lib/utils';
import { auth } from '@clerk/nextjs';
import { asc, eq, getTableColumns, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { revalidatePath } from 'next/cache';
import { sources } from 'next/dist/compiled/webpack/webpack';
import { array, number, object, string } from 'zod';

const OrdereableItemSchema = object({
  id: string().uuid(),
  order: number(),
});

const ReorderListOrder = object({
  items: array(OrdereableItemSchema),
  updateId: string().uuid(),
  boardId: string().uuid(),
});
export const reorderListAction = serverAction(
  ReorderListOrder,
  async ({ items, boardId }) => {
    const { orgId, userId } = auth();

    if (!userId) {
      throw new Error('User not authenenicated');
    }

    if (!orgId) {
      throw new Error('Board can only be created by organization');
    }

    try {
      const [currentBoard] = await db
        .select()
        .from(board)
        .where(sql`${board.id} = ${boardId} AND ${board.orgId} = ${orgId}`);

      if (!currentBoard) throw new Error('Board not found');

      await db.transaction(async () => {
        await Promise.all(
          items.map((item) =>
            db
              .update(list)
              .set({ order: item.order, updatedAt: sql<Date>`current_date` })
              .where(
                sql`${list.boardId} = ${boardId} AND ${list.id} = ${item.id}`
              )
          )
        );
      });

      const boardList = alias(list, 'board_list');
      const boardCardList = alias(card, 'board_card_list');

      const cardSelect = getTableColumns(boardCardList);
      const lists = await db
        .select({
          ...getTableColumns(boardList),
          cards: sql<Array<SelectResultFields<typeof cardSelect>>>`
         (
          With ${boardCardList} as  (
            select * from ${card}
            where ${card.listId} = ${boardList.id}
            order by ${card.order} asc
          )

          select ${jsonAggBuildObject(
            getTableColumns(boardCardList)
          )} from ${boardCardList}
         )
    `,
        })
        .from(boardList)
        .innerJoin(board, eq(boardList.boardId, board.id))
        .where(
          sql`
     ${boardList.boardId} in (
      select ${board.id} from ${board}
      where ${board.id} = ${boardId} and ${board.orgId} = ${orgId}
      )
  `
        )
        .orderBy(asc(boardList.order));

      return lists;
    } catch (e) {
      console.log(e);
      throw new Error('Something went wrong while updating');
    }
  }
);

const ReorderCardItems = object({
  sources: array(OrdereableItemSchema.extend({ listId: string().uuid() })),
  destination: array(
    OrdereableItemSchema.extend({ listId: string().uuid() })
  ).optional(),
  boardId: string().uuid(),
});
export const reorderCardAction = serverAction(
  ReorderCardItems,
  async ({ sources, destination, boardId }) => {
    const { orgId, userId } = auth();

    if (!userId) {
      throw new Error('User not authenenicated');
    }

    if (!orgId) {
      throw new Error('Board can only be created by organization');
    }

    try {
      const [currentBoard] = await db
        .select()
        .from(board)
        .where(sql`${board.id} = ${boardId} AND ${board.orgId} = ${orgId}`);

      if (!currentBoard) throw new Error('Board not found');
      console.log({ sources, destination });

      await db.transaction(async () => {
        const updateSourceCards = Promise.all(
          sources.map((item) =>
            db
              .update(card)
              .set({ order: item.order, listId: item.listId })
              .where(
                sql`${card.listId} = (
                  select id from list
                  where list.id = ${item.id} and list.board_id = ${boardId}
              ) AND ${item.id} = ${card.id}`
              )
              .returning()
              .then(([data]) => {
                console.log({ destination: false, data });

                if (!data) throw new Error('Data not found');
              })
          )
        );

        const updateDestinationCards = Promise.all(
          destination?.map((item) =>
            db
              .update(card)
              .set({ order: item.order, listId: item.listId })
              .where(
                sql`${card.listId} = (
                select id from list
                where list.id = ${item.id} and list.board_id = ${boardId}
            ) AND ${item.id} = ${card.id}`
              )
              .returning()
              .then(([data]) => {
                console.log({ destination: true, data });
                if (!data) throw new Error('Data not found');
              })
          ) ?? []
        );
        await Promise.all([updateSourceCards, updateDestinationCards]);
      });

      const boardList = alias(list, 'board_list');
      const boardCardList = alias(card, 'board_card_list');

      const cardSelect = getTableColumns(boardCardList);
      const lists = await db
        .select({
          ...getTableColumns(boardList),
          cards: sql<Array<SelectResultFields<typeof cardSelect>>>`
         (
          With ${boardCardList} as  (
            select * from ${card}
            where ${card.listId} = ${boardList.id}
            order by ${card.order} asc
          )

          select ${jsonAggBuildObject(
            getTableColumns(boardCardList)
          )} from ${boardCardList}
         )
    `,
        })
        .from(boardList)
        .innerJoin(board, eq(boardList.boardId, board.id))
        .where(
          sql`
     ${boardList.boardId} in (
      select ${board.id} from ${board}
      where ${board.id} = ${boardId} and ${board.orgId} = ${orgId}
      )
  `
        )
        .orderBy(asc(boardList.order));
      console.log(lists.map((card) => card));
      revalidatePath(`/board/${boardId}`);
      return lists;
    } catch (e) {
      console.log(e);
      throw new Error('Something went wrong while updating');
    }
  }
);
