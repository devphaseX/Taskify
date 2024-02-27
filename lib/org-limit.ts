'use server';

import { auth } from '@clerk/nextjs';
import { MAX_FREE_BOARD } from '@/constants/boards';
import { db } from './schema/db';
import { board, orgLimit } from './schema';
import { DrizzleError, eq, sql } from 'drizzle-orm';

export const updateUsedBoardCount = async () => {
  try {
    const { orgId } = auth();
    if (!orgId) {
      throw new Error('Unauthorized');
    }

    const [orgBoardLimit] = await db
      .insert(orgLimit)
      .values({
        orgId,
      })
      .onConflictDoUpdate({
        set: {
          count: sql<number>`
          (
            with "totalBoardCreated" as (
                select count(*) as total_count from ${board}
                where ${board.orgId}=  ${orgId}
            )
            select
                 least((select sum(total_count) from "totalBoardCreated"), ${MAX_FREE_BOARD})
        )
          `,
        },
        target: orgLimit.orgId,
        where: eq(orgLimit.orgId, orgId),
      })
      .returning();

    return orgBoardLimit;
  } catch (e) {
    if (Object(e) === e && e instanceof DrizzleError) {
      throw new Error('Unable to update board');
    }

    throw e;
  }
};

export const allowBoardCreate = async () => {
  try {
    const { orgId } = auth();
    if (!orgId) {
      throw new Error('Unauthorized');
    }

    const { count } = await updateUsedBoardCount();
    return !!(count < MAX_FREE_BOARD);
  } catch (e) {
    if (Object(e) === e && e instanceof DrizzleError) {
      throw new Error('Unable to update board');
    }

    throw e;
  }
};

export const getBoardCreateRemainCount = async () => {
  try {
    const { orgId } = auth();
    if (!orgId) {
      throw new Error('Unauthorized');
    }

    const { count } = await updateUsedBoardCount();
    return count;
  } catch (e) {
    if (Object(e) === e && e instanceof DrizzleError) {
      throw new Error('Unable to update board');
    }

    throw e;
  }
};
