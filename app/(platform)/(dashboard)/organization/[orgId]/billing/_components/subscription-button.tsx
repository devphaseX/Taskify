'use client';

import { stripeRedirectAction } from '@/actions/stripe-redirect';
import { Button } from '@/components/ui/button';
import { useProModal } from '@/hooks/use-pro-modal';
import { useAction } from 'next-safe-action/hooks';
import { toast } from 'sonner';

type SubscriptionButtonProps = {
  isPro?: boolean;
};
export const SubscriptionButton = ({
  isPro = false,
}: SubscriptionButtonProps) => {
  const proModal = useProModal();
  const { execute, status } = useAction(stripeRedirectAction, {
    onSuccess: ({ data: url }) => {
      window.location.href = url;
    },

    onError: ({ serverError }) => {
      serverError && toast.error(serverError);
    },
  });

  const onClick = () => {
    if (isPro) {
      execute({});
    } else {
      proModal.onOpen();
    }
  };

  return (
    <Button
      variant="primary"
      disabled={status === 'executing'}
      onClick={onClick}
    >
      {isPro ? 'Manage subscription' : 'Upgrade to pro'}
    </Button>
  );
};
