import { board, card, list } from '@/lib/schema';
import { SelectResultFields, jsonAggBuildObject } from '@/lib/utils';
import {
  BoardIdPageParams,
  BoardIdPageParamsSchema,
} from '@/lib/validations/params';
import { auth } from '@clerk/nextjs';
import { asc, eq, getTableColumns, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { redirect } from 'next/navigation';
import { ListContainer } from './_components/list-container';

type BoardIdPageProps = {
  params: BoardIdPageParams;
};

const BoardIdPage = async ({ params }: BoardIdPageProps) => {
  params = BoardIdPageParamsSchema.parse(params);
  const { orgId } = auth();

  if (!orgId) return redirect('/select-org');

  const boardList = alias(list, 'board_list');
  const boardCardList = alias(card, 'board_card_list');

  const cardSelect = getTableColumns(boardCardList);
  const lists = await db
    .select({
      ...getTableColumns(boardList),
      cards: sql<Array<SelectResultFields<typeof cardSelect>>>`
         (
          With ${boardCardList} as  (
            select * from ${card}
            where ${card.listId} = ${boardList.id}
            order by card.order asc
          )

          select ${jsonAggBuildObject(
            getTableColumns(boardCardList),
            sql` order by ${boardCardList.order} asc`
          )} from ${boardCardList}
         )
    `,
    })
    .from(boardList)
    .innerJoin(board, eq(boardList.boardId, board.id))
    .where(
      sql`
     ${boardList.boardId} in (
      select ${board.id} from ${board}
      where ${board.id} = ${params.boardId} and ${board.orgId} = ${orgId}
      )
  `
    )
    .orderBy(asc(boardList.order));

  return (
    <div className="p-4 h-full overflow-x-auto">
      <ListContainer boardId={params.boardId} data={lists} />
    </div>
  );
};

export default BoardIdPage;
