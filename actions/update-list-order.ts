'use server';

import { serverAction } from '@/lib/action';
import { board, card, list } from '@/lib/schema';
import { SelectResultFields, jsonAggBuildObject } from '@/lib/utils';
import { auth } from '@clerk/nextjs';
import { asc, eq, getTableColumns, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
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

      console.log(items);
      console.log('-------------------------------------');

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
      console.log(lists);

      return lists;
    } catch (e) {
      console.log(e);
      throw new Error('Something went wrong while updating');
    }
  }
);
