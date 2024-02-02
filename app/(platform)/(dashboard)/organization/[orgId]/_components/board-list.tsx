import { FormPopOver } from '@/components/form/form-popover';
import { Hint } from '@/components/hint';
import { HelpCircle, User2 } from 'lucide-react';
import { db } from '@/lib/schema/db';
import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { board } from '@/lib/schema';
import { sql } from 'drizzle-orm';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export const BoardList = async () => {
  const { orgId, userId } = auth();
  if (!userId) return redirect('/sign-in');
  if (!orgId) return redirect('/select-org');

  const boards = await db
    .select()
    .from(board)
    .where(sql`${board.orgId} = ${orgId}`);

  return (
    <div className="space-y-4">
      <div className="flex items-center font-semibold text-lg text-neutral-700">
        <User2 className="h-6 w-6 mr-2" />
        Your boards
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {boards.map((board) => (
          <Link
            href={`/board/${board.id}`}
            key={board.id}
            style={{ backgroundImage: `url(${board.image?.imageThumbUrl})` }}
            className="group relative aspect-video bg-no-repeat bg-center bg-cover 
            bg-fuchsia-50 rounded-sm h-full w-full p-2"
          >
            <div
              className="absolute inset-0 bg-black/30
             group-hover:bg-black/40 transition"
            />
            <p className="relative font-semibold text-white">{board.title}</p>
          </Link>
        ))}
        <FormPopOver sideOffset={10} side="right">
          <div
            role="button"
            className="aspect-video relative h-full w-full bg-muted rounded-sm flex 
          flex-col gap-y-1 items-center justify-center hover:opacity-75 transition"
          >
            <p className="text-sm">Create new board</p>
            <span className="text-xs">5 remaining</span>
            <Hint
              sideOffset={40}
              description={`Free Workspaces can have up to 5 open boards.
          For unlimited boards upgrade this workspace`}
              side="bottom"
            >
              <HelpCircle className="absolute bottom-2 right-2 h-[14px] w-[14px]" />
            </Hint>
          </div>
        </FormPopOver>
      </div>
    </div>
  );
};

BoardList.Skeleton = function SkeletonBoardList() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      <Skeleton className="aspect-video h-full w-full p-2" />
      <Skeleton className="aspect-video h-full w-full p-2" />
      <Skeleton className="aspect-video h-full w-full p-2" />
      <Skeleton className="aspect-video h-full w-full p-2" />
      <Skeleton className="aspect-video h-full w-full p-2" />
      <Skeleton className="aspect-video h-full w-full p-2" />
      <Skeleton className="aspect-video h-full w-full p-2" />
      <Skeleton className="aspect-video h-full w-full p-2" />
    </div>
  );
};
