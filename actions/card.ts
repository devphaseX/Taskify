'use server';
import { eq, getTableColumns, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { TypeOf, string } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { serverAction } from '@/lib/action';
import { board, card, list } from '@/lib/schema';
import { auth } from '@clerk/nextjs';
import { db } from '@/lib/schema/db';

const CreateCardSchema = createInsertSchema(card, {
  listId: string().uuid(),
  title: string()
    .min(3, { message: 'Title is too short' })
    .max(256, { message: 'Title should be within 256 characters' }),
  description: string().min(3),
})
  .extend({ boardId: string().uuid() })
  .pick({ listId: true, title: true, description: true, boardId: true });

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
