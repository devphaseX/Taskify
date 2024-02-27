'use server';

import { auth } from '@clerk/nextjs';
import { MAX_FREE_BOARD } from '@/constants/boards';
import { db } from './schema/db';
import { board, orgLimit } from './schema';
import { DrizzleError, eq, sql } from 'drizzle-orm';
import { PostgresError } from 'postgres';

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
    if (
      Object(e) === e &&
      (e instanceof DrizzleError || e instanceof PostgresError)
    ) {
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

    const [boardLimit] = await db
      .select()
      .from(orgLimit)
      .where(eq(orgLimit.orgId, orgId));

    return !(boardLimit && boardLimit.count < MAX_FREE_BOARD);
  } catch (e) {
    if (
      Object(e) === e &&
      (e instanceof DrizzleError || e instanceof PostgresError)
    ) {
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

    const [boardLimit] = await db
      .select()
      .from(orgLimit)
      .where(eq(orgLimit.orgId, orgId));

    return boardLimit?.count ?? 0;
  } catch (e) {
    if (
      Object(e) === e &&
      (e instanceof DrizzleError || e instanceof PostgresError)
    ) {
      throw new Error('Unable to update board');
    }

    throw e;
  }
};
