'use client';

import { copyCardAction, deleteCardAction } from '@/actions/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCardModal } from '@/hooks/use-card-modal';
import { CardWithList } from '@/types';
import { Copy, Trash } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

type ActionsProps = {
  data: CardWithList;
};
export const Actions = ({ data }: ActionsProps) => {
  const { boardId } = useParams() as { boardId: string };
  const { execute: copyCard, status: copyCardStatus } = useAction(
    copyCardAction,
    {
      onSuccess: (copiedData) => {
        toast.success(`Card "${copiedData.title}" copied`);
        setTimeout(() => {
          onCloseModal();
        });
      },
      onError: ({ serverError }) => {
        serverError && toast.error(serverError);
      },
    }
  );
  const { execute: deleteCard, status: deleteCardStatus } = useAction(
    deleteCardAction,
    {
      onSuccess: () => {
        toast.success(`Card "${data.title}" copied`);
        setTimeout(() => {
          onCloseModal();
        });
      },
      onError: ({ serverError }) => {
        serverError && toast.error(serverError);
      },
    }
  );

  const onCopyCard = () => {
    copyCard({ id: data.id, boardId });
  };

  const onDeleteCard = () => {
    deleteCard({ id: data.id, boardId });
  };

  const runningAction =
    copyCardStatus === 'executing' || deleteCardStatus === 'executing';

  const onCloseModal = useCardModal((state) => state.onClose);

  return (
    <div className="space-y-2 mt-2">
      <p className="text-xs font-bold">Actions</p>
      <Button
        variant="gray"
        className="w-full justify-start"
        size="inline"
        disabled={runningAction}
        onClick={onCopyCard}
      >
        <Copy className="w-4 h-4 mr-2" />
        Copy
      </Button>
      <Button
        variant="gray"
        className="w-full justify-start"
        size="inline"
        disabled={runningAction}
        onClick={onDeleteCard}
      >
        <Trash className="w-4 h-4 mr-2" />
        Delete
      </Button>
    </div>
  );
};

Actions.Skeleton = function ActionsSkeleton() {
  return (
    <div className="space-y-2 mt-2">
      <Skeleton className="w-20 h-4 bg-neutral-200" />
      <Skeleton className="w-full h-8 bg-neutral-200" />
      <Skeleton className="w-full h-8 bg-neutral-200" />
    </div>
  );
};
