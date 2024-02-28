'use server';

import { serverAction } from '@/lib/action';
import { board } from '@/lib/schema';
import { auth } from '@clerk/nextjs';
import { revalidatePath } from 'next/cache';
import { TypeOf, object, string } from 'zod';
import { db } from '@/lib/schema/db';
import { eq, sql } from 'drizzle-orm';
import { capitalize } from '@/lib/utils';
import { createAuditLog } from './create-audit';
import { allowBoardCreate, updateUsedBoardCount } from '@/lib/org-limit';
import { checkSubscriptionStatus } from '@/lib/subscription';

const CreateBoardSchema = object({
  title: string({ invalid_type_error: 'Title is required' }).min(3, {
    message: 'Title too short.',
  }),
  image: string({ invalid_type_error: 'Image is required' }).transform(
    (image) =>
      Object.fromEntries(
        image.split('|').map((item) => {
          const keyEndIndex = item.search(/:/);

          const [key, value] = [
            item.slice(0, keyEndIndex).trim(),
            item.slice(keyEndIndex + 1).trim(),
          ];
          const valueUrlType = string().url(value).safeParse(value).success;

          return [
            `image${capitalize(key)}${valueUrlType ? 'Url' : ''}`,
            value,
          ] as [`image${string}${'url' | ''}`, string];
        })
      )
  ),
});
export type CreateBoardInput = TypeOf<typeof CreateBoardSchema>;

const createBoardAction = serverAction(CreateBoardSchema, async (form) => {
  const { orgId, userId } = auth();

  if (!userId) {
    throw new Error('User not authenenicated');
  }

  if (!orgId) {
    throw new Error('Board can only be created by organization');
  }

  const [isPro, freeTierAllowed] = await Promise.all([
    checkSubscriptionStatus(),
    allowBoardCreate(),
  ]);

  if (!isPro || !freeTierAllowed) {
    throw new Error(
      'You have reach the limit for your free boards.Please upgrade to create more'
    );
  }

  try {
    const newBoard = await db.transaction(async () => {
      const [newBoard] = await db
        .insert(board)
        .values({ title: form.title, orgId, image: form.image })
        .returning();

      if (!isPro) {
        await updateUsedBoardCount();
      }

      return newBoard;
    });

    revalidatePath(`/organization/${orgId}`);

    await createAuditLog({
      data: {
        entityId: newBoard.id,
        action: 'create',
        entityType: 'board',
        entityTitle: newBoard.title,
      },
    });

    return { message: 'Board created successfully' as string, data: newBoard };
  } catch (e) {
    throw new Error('An error occurred while creating board');
  }
});

const UpdateBoardSchema = CreateBoardSchema.pick({ title: true }).extend({
  id: string().uuid(),
});

export type UpdateBoardInput = TypeOf<typeof UpdateBoardSchema>;

export const updateBoardAction = serverAction(
  UpdateBoardSchema,
  async (form) => {
    const { orgId, userId } = auth();

    if (!userId) {
      throw new Error('User not authenenicated');
    }

    if (!orgId) {
      throw new Error('Board can only be update by organization');
    }

    try {
      const [updateBoard] = await db
        .update(board)
        .set({ title: form.title })
        .where(sql`${board.orgId} = ${orgId} AND ${board.id} = ${form.id}`)
        .returning();

      if (!updateBoard) {
        throw new Error('Board not found');
      }

      await createAuditLog({
        data: {
          entityId: updateBoard.id,
          action: 'update',
          entityType: 'list',
          entityTitle: updateBoard.title,
        },
      });
      revalidatePath(`/board/${updateBoard.id}`);
      return updateBoard;
    } catch (e) {
      throw new Error('An error occurred while updating board');
    }
  }
);

const DeleteBoardSchema = object({ id: string().uuid() });
export type DeleteBoardInput = TypeOf<typeof DeleteBoardSchema>;
const deleteBoardAction = serverAction(DeleteBoardSchema, async ({ id }) => {
  const { orgId, userId } = auth();

  if (!userId) {
    throw new Error('User not authenenicated');
  }

  if (!orgId) {
    throw new Error('Board can only be created by organization');
  }

  const isPro = await checkSubscriptionStatus();

  try {
    const deletedBoard = await db.transaction(async () => {
      const [deletedBoard] = await db
        .delete(board)
        .where(sql`${board.id} = ${id} AND ${board.orgId} = ${orgId}`)
        .returning();

      await createAuditLog({
        data: {
          entityId: deletedBoard.id,
          action: 'delete',
          entityType: 'list',
          entityTitle: deletedBoard.title,
        },
      });

      if (!isPro) {
        await updateUsedBoardCount();
      }
      return deletedBoard;
    });

    return { data: { deletedBoard } };
  } catch (e) {
    console.log(e);
    throw new Error('An error occurred while removing board.');
  }
});

export { createBoardAction, deleteBoardAction };
