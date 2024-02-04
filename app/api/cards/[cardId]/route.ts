import {
  CardIdRouteParam,
  CardIdRouteParamSchema,
} from '@/lib/validations/params';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { StatusCodes } from 'http-status-codes';
import { auth } from '@clerk/nextjs';
import { board, card, list } from '@/lib/schema';
import { eq, getTableColumns, sql } from 'drizzle-orm';

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

    const [currentCard] = await db
      .select({ ...getTableColumns(card), listTitle: list.title })
      .from(card)
      .innerJoin(list, eq(list.id, card.listId)).where(sql`
        ${cardId} = ${card.id} AND ${card.listId} in (
            select ${list.id} from ${list} 
            inner join ${board} on ${board.id} = ${list.boardId}
            where ${board.orgId} = ${orgId}
        )
      `);

    if (!currentCard) {
      return NextResponse.json(
        { message: 'Card not found' },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    return NextResponse.json({ data: currentCard });
  } catch (e) {
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
