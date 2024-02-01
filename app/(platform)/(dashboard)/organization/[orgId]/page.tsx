import { createBoardAction } from '@/actions/board';
import { Button } from '@/components/ui/button';
import { board } from '@/lib/schema';
import { db } from '@/lib/schema/db';
import { Board } from './board';
import { CreateBoardForm } from './_components/create-board-form';

export const dynamic = 'force-dynamic';

const OrganizationPage = async () => {
  const create = async (form: FormData) => {
    'use server';
    const title = form.get('title');
    if (title) {
      createBoardAction({ title: title as string });
    }
  };

  const boards = await db.select().from(board);

  return (
    <div className="flex flex-col space-y-4">
      <CreateBoardForm />
      <div className="space-y-2">
        {boards.map((board) => (
          <Board key={board.id} {...board} />
        ))}
      </div>
    </div>
  );
};

export default OrganizationPage;
