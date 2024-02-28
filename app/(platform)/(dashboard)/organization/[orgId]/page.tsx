import { Info } from './_components/info';
import { Separator } from '@/components/ui/separator';
import { BoardList } from './_components/board-list';
import { Suspense } from 'react';
import { checkSubscriptionStatus } from '@/lib/subscription';

export const dynamic = 'force-dynamic';

const OrganizationPage = async () => {
  const isPro = await checkSubscriptionStatus();
  return (
    <div className="w-full mb-20">
      <Info isPro={isPro} />
      <Separator className="my-4" />
      <div className="px-2 md:px-4">
        <Suspense fallback={<BoardList.Skeleton />}>
          <BoardList />
        </Suspense>
      </div>
    </div>
  );
};

export default OrganizationPage;
