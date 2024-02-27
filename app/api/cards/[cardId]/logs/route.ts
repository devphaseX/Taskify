import {
  CardIdRouteParam,
  CardIdRouteParamSchema,
} from '@/lib/validations/params';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { StatusCodes } from 'http-status-codes';
import { auth } from '@clerk/nextjs';
import { auditLog, board, card, list } from '@/lib/schema';
import { desc, eq, getTableColumns, sql } from 'drizzle-orm';
import { jsonAggBuildObject } from '@/lib/utils';
import { PgDialect, alias } from 'drizzle-orm/pg-core';

export async function GET(
  req: Request,
  { params }: { params: CardIdRouteParam }
) {
  try {
    params = CardIdRouteParamSchema.parse(params);
    const { cardId } = params;
    const { userId, orgId } = auth();

    if (!(userId && orgId)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: StatusCodes.UNAUTHORIZED }
      );
    }

    const cardAuditLog = alias(auditLog, 'card_audit_log');
    const cardAuditLogSelect = getTableColumns(cardAuditLog);
    const selectCard = alias(card, 'select_card');

    const [currentCard] = await db
      .select({
        ...getTableColumns(selectCard),
        logs: sql`
            ( select ${jsonAggBuildObject(
              cardAuditLogSelect,
              sql` order by ${desc(cardAuditLogSelect.createdAt)} `
            )} from 
              (
                select * from ${auditLog}
                where ${selectCard.id} = ${auditLog.entityId}
                order by ${auditLog.createdAt} desc
                limit 3
                ) ${cardAuditLog}
                group by ${cardAuditLog.createdAt}
            )
        `,
      })
      .from(selectCard)
      .leftJoin(list, eq(list.id, selectCard.listId))
      .where(
        sql`
          ${cardId} = ${selectCard.id} AND ${selectCard.listId} in (
              select ${list.id} from ${list} 
              inner join ${board} on ${board.id} = ${list.boardId}
              where ${board.orgId} = ${orgId}
          )
        `
      );

    if (!currentCard) {
      return NextResponse.json(
        { message: 'Card not found' },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    return NextResponse.json({ data: currentCard.logs ?? [] });
  } catch (e) {
    console.log(e);
    if (e instanceof ZodError) {
      return NextResponse.json(
        { errors: e.flatten().fieldErrors },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
