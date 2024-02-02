'use server';

import { serverAction } from '@/lib/action';
import { board } from '@/lib/schema';
import { auth } from '@clerk/nextjs';
import { revalidatePath } from 'next/cache';
import { TypeOf, object, string } from 'zod';
import { db } from '@/lib/schema/db';
import { eq } from 'drizzle-orm';
import { capitalize } from '@/lib/utils';

const CreateBoardSchema = object({
  title: string({ invalid_type_error: 'Title is required' }).min(3, {
    message: 'Title too short.',
  }),
  image: string({ invalid_type_error: 'Image is required' }).transform(
    (image) =>
      Object.fromEntries(
        image.split('|').map((item) => {
          const [key, value] = item.split(':', 2);
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

    return { message: 'Board created successfully', data: newBoard };
  } catch (e) {
    throw new Error('An error occurred while creating board');
  }
});

const DeleteBoardSchema = object({ id: string().uuid() });
export type DeleteBoardInput = TypeOf<typeof DeleteBoardSchema>;
const deleteBoardAction = serverAction(DeleteBoardSchema, async ({ id }) => {
  const { orgId, userId } = auth();

  if (!userId) {
    return new Error('User not authenenicated');
  }

  if (!orgId) {
    return new Error('Board can only be created by organization');
  }
  try {
    await db.delete(board).where(eq(board.id, id));
    revalidatePath(`/organization/${orgId}`);

    return { message: 'Board removed successfully' };
  } catch (e) {
    return { error: 'An error occurred while removing board.' };
  }
});

export { createBoardAction, deleteBoardAction };
