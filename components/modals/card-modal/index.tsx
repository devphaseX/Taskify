'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useCardModal } from '@/hooks/use-card-modal';
import { fetcher } from '@/lib/fetcher';
import { CardWithList } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { Header } from './header';
import { Description } from './description';
import { Actions } from './actions';
import { AuditLog } from '@/lib/schema';
import { Activity } from './activity';

export const CardModal = () => {
  const id = useCardModal((state) => state.id);
  const opened = useCardModal((state) => state.opened);
  const onClose = useCardModal((state) => state.onClose);
  const { data } = useQuery<{ data: CardWithList }>({
    queryKey: ['card', id],
    queryFn: () => fetcher(`/api/cards/${id}`),
    enabled: !!id,
  });

  const { data: cardLogData, status: cardLogDataStatus } = useQuery<{
    data: Array<AuditLog>;
  }>({
    queryKey: ['card-logs', id],
    queryFn: ({ queryKey: [_, id] }) => fetcher(`/api/cards/${id}/logs`),
    enabled: !!id,
  });

  const cardData = data?.data;
  return (
    <Dialog open={opened} onOpenChange={onClose}>
      <DialogContent>
        {cardData ? <Header data={cardData} /> : <Header.Skeleton />}
        <div className="grid grid-cols-1 md:grid-cols-4 md:gap-4">
          <div className="col-span-3">
            <div className="w-full space-y-6">
              {cardData ? (
                <Description data={cardData} />
              ) : (
                <Description.Skeleton />
              )}

              {cardLogData?.data ? (
                <Activity data={cardLogData?.data} />
              ) : cardLogDataStatus === 'pending' ? (
                <Activity.Skeleton />
              ) : null}
            </div>
          </div>
          {cardData ? <Actions data={cardData} /> : <Actions.Skeleton />}
        </div>
      </DialogContent>
    </Dialog>
  );
};
