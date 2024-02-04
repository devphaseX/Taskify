'use server';

import { serverAction } from '@/lib/action';
import { board } from '@/lib/schema';
import { auth } from '@clerk/nextjs';
import { revalidatePath } from 'next/cache';
import { TypeOf, object, string } from 'zod';
import { db } from '@/lib/schema/db';
import { eq, sql } from 'drizzle-orm';
import { capitalize } from '@/lib/utils';
import { redirect } from 'next/navigation';

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
  try {
    const [newBoard] = await db
      .insert(board)
      .values({ title: form.title, orgId, image: form.image })
      .returning();
    revalidatePath(`/organization/${orgId}`);

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

  try {
    await db
      .delete(board)
      .where(sql`${board.id} = ${id} AND ${board.orgId} = ${orgId}`);
    return redirect(`/organization/${orgId}`);
  } catch (e) {
    throw new Error('An error occurred while removing board.');
  }
});

export { createBoardAction, deleteBoardAction };
