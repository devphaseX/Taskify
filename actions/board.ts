'use server';

import { serverAction } from '@/lib/action';
import { board } from '@/lib/schema';
import { auth } from '@clerk/nextjs';
import { revalidatePath } from 'next/cache';
import { object, string } from 'zod';
import { db } from '@/lib/schema/db';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

const createBoardAction = serverAction(
  object({
    title: string({ invalid_type_error: 'Title is required' }).min(3, {
      message: 'Title too short.',
    }),
  }),
  async (form) => {
    const { orgId } = auth();
    await db.insert(board).values({ title: form.title });
    revalidatePath(`/organization/${orgId}`);

    return { message: 'Board created successfully' };
  }
);

const deleteBoardAction = serverAction(
  object({ id: string().uuid() }),
  async ({ id }) => {
    const { orgId } = await auth();
    await db.delete(board).where(eq(board.id, id));
    revalidatePath(`/organization/${orgId}`);
    return { message: 'Board removed successfully' };
  }
);

export { createBoardAction, deleteBoardAction };
