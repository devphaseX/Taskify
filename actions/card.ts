'use server';
import { eq, getTableColumns, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { TypeOf, nullable, string } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { serverAction } from '@/lib/action';
import { board, card, list } from '@/lib/schema';
import { auth } from '@clerk/nextjs';
import { db } from '@/lib/schema/db';
import { stringify } from 'querystring';

const CreateCardSchema = createInsertSchema(card, {
  listId: string().uuid(),
  title: string()
    .min(3, { message: 'Title is too short' })
    .max(256, { message: 'Title should be within 256 characters' }),
  description: string().min(3),
})
  .extend({ boardId: string().uuid() })
  .pick({
    id: true,
    listId: true,
    title: true,
    description: true,
    boardId: true,
  });

export type CreateCardInput = TypeOf<typeof CreateCardSchema>;

export const createCardAction = serverAction(CreateCardSchema, async (form) => {
  const { orgId, userId } = auth();

  if (!userId) {
    throw new Error('User not authenenicated');
  }

  if (!orgId) {
    throw new Error('Board can only be created by organization');
  }
  try {
    const { listId, boardId, title } = form;
    const [currentList] = await db
      .select({
        ...getTableColumns(list),
      })
      .from(list)
      .innerJoin(board, eq(board.id, list.boardId)).where(sql`
           ${boardId} = ${board.id} AND 
            ${board.orgId} = ${orgId} AND
             ${list.id} = ${listId}
      `);

    if (!currentList) throw new Error('List not found');

    const [newCard] = await db
      .insert(card)
      .values({
        title,
        listId,
        order: sql<number>`
            coalesce(
                (
                    select max(card.order)::integer + 1 from card
                    where card.list_id = ${sql.raw(`'${listId}'`)}
                ), 1)
      `,
      })
      .returning();

    revalidatePath(`/board/${boardId}`);

    return newCard;
  } catch (e) {
    throw new Error('An error occurred while creating board');
  }
});

const UpdateCardSchema = CreateCardSchema.pick({
  id: true,
  title: true,
  description: true,
})
  .required({ id: true })
  .extend({
    boardId: string().uuid(),
    title: string()
      .min(3, { message: 'Title is too short' })
      .max(256, { message: 'Title is more than 256 characters' })
      .optional(),
  });

export type UpdateCardInput = TypeOf<typeof UpdateCardSchema>;

export const UpdateCardAction = serverAction(UpdateCardSchema, async (form) => {
  const { orgId, userId } = auth();

  if (!userId) {
    throw new Error('User not authenenicated');
  }

  if (!orgId) {
    throw new Error('Card can only be updated by organization');
  }
  try {
    const { id, title, description, boardId } = form;
    const [updatedCard] = await db
      .update(card)
      .set({
        title: sql`coalesce(${title ?? null}, card.title)`,
        description: sql`coalesce(${description ?? null}, card.description)`,
      })
      .where(
        sql`${card.id} = ${id} and  ${card.listId} in (
        select ${list.id} from ${list}
        where ${list.boardId} = ${boardId}
      )`
      )
      .returning();

    if (!updatedCard) throw new Error('Card not found');

    revalidatePath(`/board/${boardId}`);

    return updatedCard;
  } catch (e) {
    throw new Error('An error occurred while updating card');
  }
});

const CopyCardSchema = CreateCardSchema.pick({
  id: true,
  boardId: true,
}).required({ id: true, boardId: true });
export type CopyCardInput = TypeOf<typeof CopyCardSchema>;
export const copyCardAction = serverAction(
  CopyCardSchema,
  async ({ id, boardId }) => {
    const { orgId, userId } = auth();

    if (!userId) {
      throw new Error('User not authenenicated');
    }

    if (!orgId) {
      throw new Error('Card can only be copied by organization');
    }

    try {
      const [currentBoard] = await db
        .select()
        .from(board)
        .where(sql`${board.orgId} = ${orgId} AND ${board.id} = ${boardId}`);

      if (!currentBoard) throw new Error('Board not found');

      const [currentCard] = await db
        .select()
        .from(card)

        .where(
          sql`${card.id} = ${id} and  ${card.listId} in (
      select ${list.id} from ${list}
      where ${list.boardId} = ${boardId}
    )`
        );

      if (!currentCard) throw new Error('Card not found');

      const [copiedCard] = await db
        .insert(card)
        .values({
          title: `${currentCard.title}-Copy`,
          description: currentCard.description,
          listId: currentCard.listId,
          order: sql<number>`
         coalesce(
          (
           select max(${card.order})::integer + 1 from ${card}
           where ${card.listId} = ${sql.raw(`'${currentCard.listId}'`)}
          ),
          1)
          `,
        })
        .returning();

      revalidatePath(`/board/${boardId}`);
      return copiedCard;
    } catch (e) {
      console.log(e);
      throw new Error('An error occurred while coping card.');
    }
  }
);

const DeleteCardSchema = CreateCardSchema.pick({
  id: true,
  boardId: true,
}).required({ id: true, boardId: true });
export type DeleteCardInput = TypeOf<typeof DeleteCardSchema>;
export const deleteCardAction = serverAction(
  CopyCardSchema,
  async ({ id, boardId }) => {
    const { orgId, userId } = auth();

    if (!userId) {
      throw new Error('User not authenenicated');
    }

    if (!orgId) {
      throw new Error('Card can only be copied by organization');
    }

    try {
      const [currentBoard] = await db
        .select()
        .from(board)
        .where(sql`${board.orgId} = ${orgId} AND ${board.id} = ${boardId}`);

      if (!currentBoard) throw new Error('Board not found');

      const [deleteCard] = await db
        .delete(card)

        .where(
          sql`${card.id} = ${id} and  ${card.listId} in (
      select ${list.id} from ${list}
      where ${list.boardId} = ${boardId}
    )`
        )
        .returning();

      if (!deleteCard) throw new Error('Card not found');

      revalidatePath(`/board/${boardId}`);
      return deleteCard;
    } catch (e) {
      throw new Error('An error occurred while deleting card.');
    }
  }
);
