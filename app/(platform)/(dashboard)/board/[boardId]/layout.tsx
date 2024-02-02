import { board } from '@/lib/schema';
import {
  BoardIdPageParams,
  BoardIdPageParamsSchema,
} from '@/lib/validations/params';
import { auth } from '@clerk/nextjs';
import { sql } from 'drizzle-orm';
import { eq } from 'lodash';
import { notFound, redirect } from 'next/navigation';
import { BoardNavbar } from './_components/board-navbar';
import { db } from '@/lib/schema/db';

export async function generateMetadata({
  params: { boardId },
}: {
  params: BoardIdPageParams;
}) {
  const { orgId } = auth();

  if (!orgId) {
    return {
      title: 'Board',
    };
  }

  const [currentBoard] = await db.select().from(board).where(sql`
    ${board.id} = ${boardId} AND ${board.orgId} = ${orgId}
`);

  return { title: currentBoard?.title ?? 'Board' };
}

const BoardIdLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: BoardIdPageParams;
}) => {
  {
    let paramsResult = BoardIdPageParamsSchema.safeParse(params);
    if (!paramsResult.success) {
      throw new Error('Invalid BoardPage Id');
    }
    params = paramsResult.data;
  }

  const { orgId, userId } = auth();
  if (!userId) return redirect('/sign-in');
  if (!orgId) return redirect('/select-org');

  const { boardId } = params;

  const [currentBoard] = await db.select().from(board).where(sql`
        ${board.id} = ${boardId} AND ${board.orgId} = ${orgId}
  `);

  if (!currentBoard) {
    return notFound();
  }

  return (
    <div
      className="relative h-full bg-no-repeat bg-cover bg-center"
      style={{ backgroundImage: `url(${currentBoard.image?.imageFullUrl})` }}
    >
      <BoardNavbar id={params.boardId} board={currentBoard} />
      <div className="absolute bg-black/10 inset-0 z-[-1]" />
      <main className="relative pt-28 h-full">{children}</main>
    </div>
  );
};

export default BoardIdLayout;
