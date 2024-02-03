'use server';

import { serverAction } from '@/lib/action';
import { board, card, list } from '@/lib/schema';
import { auth } from '@clerk/nextjs';
import { revalidatePath } from 'next/cache';
import { TypeOf, object, string } from 'zod';
import { db } from '@/lib/schema/db';

import { createInsertSchema } from 'drizzle-zod';
import { asc, getTableColumns, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { SelectResultFields, jsonAggBuildObject } from '@/lib/utils';

const CreateListSchema = createInsertSchema(list, {
  boardId: string().uuid(),
  title: string({ required_error: 'Title is required' }).min(3, {
    message: 'Title is too short',
  }),
});

export type CreateListInput = TypeOf<typeof CreateListSchema>;

export const createListAction = serverAction(CreateListSchema, async (form) => {
  const { orgId, userId } = auth();

  if (!userId) {
    throw new Error('User not authenenicated');
  }

  if (!orgId) {
    throw new Error('List can only be created by organization');
  }

  try {
    const [currentBoard] = await db
      .select()
      .from(board)
      .where(sql`${board.orgId} = ${orgId} AND ${board.id} = ${form.boardId}`);

    if (!currentBoard) throw new Error('Board not found');

    const [newList] = await db
      .insert(list)
      .values({ ...form, boardId: currentBoard.id })
      .returning();

    revalidatePath(`/board/${form.boardId}`);
    return newList;
  } catch (e) {
    throw new Error('An error occurred while creating board');
  }
});

const UpdateListSchema = CreateListSchema.pick({
  title: true,
  boardId: true,
  id: true,
}).required({ title: true, boardId: true, id: true });

export type UpdateListInput = TypeOf<typeof UpdateListSchema>;

export const updateListAction = serverAction(UpdateListSchema, async (form) => {
  const { orgId, userId } = auth();

  if (!userId) {
    throw new Error('User not authenenicated');
  }

  if (!orgId) {
    throw new Error('List can only be created by organization');
  }

  try {
    const [currentBoard] = await db
      .select()
      .from(board)
      .where(sql`${board.orgId} = ${orgId} AND ${board.id} = ${form.boardId}`);

    if (!currentBoard) throw new Error('Board not found');

    const [newList] = await db
      .update(list)
      .set({ title: form.title })
      .where(
        sql`${list.boardId} = ${currentBoard.id} AND ${list.id} = ${form.id}`
      )
      .returning();

    revalidatePath(`/board/${form.boardId}`);
    return newList;
  } catch (e) {
    throw new Error('An error occurred while creating board');
  }
});

const DeleteListSchema = CreateListSchema.pick({
  id: true,
  boardId: true,
}).required({ id: true, boardId: true });
export type DeleteListInput = TypeOf<typeof DeleteListSchema>;
export const deleteListAction = serverAction(
  DeleteListSchema,
  async ({ id, boardId }) => {
    const { orgId, userId } = auth();

    if (!userId) {
      throw new Error('User not authenenicated');
    }

    if (!orgId) {
      throw new Error('Board can only be created by organization');
    }

    try {
      const [deletedList] = await db
        .delete(list)
        .where(
          sql`${list.id} = ${id} AND ${list.boardId}  = (
          select ${board.id} from ${board}
          where ${board.id} = ${boardId} AND ${board.orgId} = ${orgId}
        )`
        )
        .returning();
      revalidatePath(`/board/${boardId}`);

      return deletedList;
    } catch (e) {
      throw new Error('An error occurred while removing board.');
    }
  }
);

const CopyListSchema = CreateListSchema.pick({
  id: true,
  boardId: true,
}).required({ id: true, boardId: true });
export type CopyListInput = TypeOf<typeof CopyListSchema>;
export const copyListAction = serverAction(
  CopyListSchema,
  async ({ id, boardId }) => {
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
        .where(sql`${board.orgId} = ${orgId} AND ${board.id} = ${boardId}`);

      if (!currentBoard) throw new Error('Board not found');

      const boardList = alias(list, 'board_list');
      const boardCardList = alias(card, 'board_card_list');

      const cardSelect = getTableColumns(boardCardList);
      const [currentList] = await db
        .select({
          ...getTableColumns(boardList),
          cards: sql<Array<SelectResultFields<typeof cardSelect>>>`
            (
              select 
              ${jsonAggBuildObject(cardSelect)} from 
              (
                select * from ${card}
                where ${card.listId} = ${boardList.id}
                order by ${card.order} asc
              ) ${boardCardList}
            )
        `,
        })
        .from(boardList)
        .where(
          sql`${boardList.id} = ${id} AND ${boardList.boardId}  = (
            select ${board.id} from ${board}
            where ${board.id} = ${boardId} AND ${board.orgId} = ${orgId}
          )`
        );

      if (!currentList) throw new Error('List not found');

      const [copiedList] = await db.transaction(async (tx) => {
        const {
          id: _id,
          order: _order,
          createdAt: _createdAt,
          updatedAt: _updatedAt,
          ...shareProps
        } = currentList;
        const [newList] = await tx.insert(list).values(shareProps).returning();

        await Promise.all(
          currentList.cards.map(
            ({
              id: _id,
              createdAt: _createdAt,
              updatedAt: _updatedAt,
              listId: _listId,
              ...shareProps
            }) => db.insert(card).values({ ...shareProps, listId: newList.id })
          )
        );

        return await db
          .select({
            ...getTableColumns(boardList),
            cards: sql<Array<SelectResultFields<typeof cardSelect>>>`
            (
              select
              ${jsonAggBuildObject(cardSelect)} from
              (
                select * from ${card}
                where ${card.listId} = ${boardList.id}
                order by ${card.order} asc
              ) ${boardCardList}
            )
        `,
          })
          .from(boardList)
          .where(
            sql`${boardList.id} = ${newList.id} AND ${boardList.boardId}  = (
            select ${board.id} from ${board}
            where ${board.id} = ${boardId} AND ${board.orgId} = ${orgId}
          )`
          );
      });

      revalidatePath(`/board/${boardId}`);

      return copiedList;
    } catch (e) {
      console.log(e);
      throw new Error('An error occurred while coping list.');
    }
  }
);