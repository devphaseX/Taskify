'use client';

import { useProModal } from '@/hooks/use-pro-modal';
import { Dialog, DialogContent } from '../ui/dialog';
import Image from 'next/image';
import { Button } from '../ui/button';
import { useAction } from 'next-safe-action/hook';
import { stripeRedirectAction } from '@/actions/stripe-redirect';
import { toast } from 'sonner';

export const ProModal = () => {
  const { opened, onClose } = useProModal();
  const { execute, status } = useAction(stripeRedirectAction, {
    onSuccess: ({ data: url }) => {
      window.location.href = url;
    },

    onError({ serverError }) {
      serverError && toast.error(serverError);
    },
  });
  return (
    <Dialog open={opened} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="aspect-video relative flex items-center justify-center">
          <Image src="/hero.svg" alt="hero" className="object-cover" fill />
        </div>
        <div className="text-neutral-700 mx-auto space-y-6 p-6">
          <h2 className="font-semibold text-xl">
            Upgrade to Taskify pro Today!
          </h2>
          <p className="text-xs font-semibold text-neutral-600">
            Explore the best of Taskify
          </p>
          <div className="pl-3">
            <ul className="text-sm list-disc">
              <li>Unlimited boards</li>
              <li>Advanced checklists</li>
              <li>Admin and security features</li>
              <li>And more!</li>
            </ul>
          </div>
          <Button
            className="w-full"
            variant="primary"
            onClick={() => execute({})}
            disabled={status === 'executing'}
          >
            Upgrade
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
