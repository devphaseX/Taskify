'use client';

import { deleteBoardAction } from '@/actions/board';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { board } from '@/lib/schema';
import { useAuth } from '@clerk/nextjs';
import { MoreHorizontal, X } from 'lucide-react';
import { useAction } from 'next-safe-action/hook';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
type BoardOptionsProps = {
  id: string;
};

export const BoardOptions = ({ id }: BoardOptionsProps) => {
  const [opened, setOpened] = useState(false);
  const router = useRouter();
  const { orgId } = useAuth();
  const { execute: deleteBoard, status } = useAction(deleteBoardAction, {
    onSuccess: () => {
      toast.success('Board delete succesfully');
      router.push(`/organization/${orgId}`);
      router.refresh();
    },
    onError: () => {
      toast.error('Board delete failed');
    },
  });
  return (
    <Popover open={opened} onOpenChange={setOpened}>
      <PopoverTrigger asChild>
        <Button className="h-auto w-auto p-2" variant="transparent">
          <MoreHorizontal className="w-4 h-4 " />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="relative px-0 pt-3 pb-3"
        side="bottom"
        align="start"
      >
        <div className="text-sm font-medium text-center text-neutral-600 pb-4">
          Board actions
        </div>
        <Button
          className="h-auto w-auto p-2 absolute top-2 right-2 text-neutral-600"
          variant="transparent"
          disabled={status === 'executing'}
        >
          <X className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            deleteBoard({ id });
          }}
          className="rounded-none w-full h-auto p-2 
          px-5 justify-start font-normal text-sm"
          disabled={status === 'executing'}
        >
          Delete this board
        </Button>
      </PopoverContent>
    </Popover>
  );
};
