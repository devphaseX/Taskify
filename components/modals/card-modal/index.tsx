'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useCardModal } from '@/hooks/use-card-modal';

export const CardModal = () => {
  const id = useCardModal((state) => state.id);
  const opened = useCardModal((state) => state.opened);
  const onClose = useCardModal((state) => state.onClose);

  return (
    <Dialog open={opened} onOpenChange={onClose}>
      <DialogContent>I am a modal</DialogContent>
    </Dialog>
  );
};
