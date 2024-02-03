'use client';

import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useAction } from 'next-safe-action/hook';
import { CreateBoardInput, createBoardAction } from '@/actions/board';
import { FormInput } from './form-input';
import { FormSubmit } from './form-submit';
import { useCallback, useState } from 'react';
import { Button } from '../ui/button';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { FormPicker } from './form-picker';
import { useParams, useRouter } from 'next/navigation';

type FormPopOverProps = {
  children: React.ReactNode;
  side?: 'left' | 'right' | 'top' | 'bottom';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
};

export const FormPopOver = ({
  align,
  side,
  children,
  sideOffset = 0,
}: FormPopOverProps) => {
  const [opened, setOpened] = useState(false);
  const router = useRouter();
  const { execute, result, reset } = useAction(createBoardAction, {
    onSuccess: ({ message, data }) => {
      reset();
      toast.success(message);
      setOpened(false);
      router.push(`/board/${data.id}`);
    },
    onError: ({ serverError }) => {
      toast.error(serverError);
    },
  });

  console.log({ result });

  const onSubmit = useCallback((form: FormData) => {
    const payload = Object.fromEntries(form) as unknown as CreateBoardInput;
    console.log({ payload });
    execute(payload as any);
  }, []);

  return (
    <Popover open={opened} onOpenChange={setOpened}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align={align}
        className="w-80 pt-3"
        side={side}
        sideOffset={sideOffset}
      >
        <div className="text-sm font-medium text-center text-neutral-600 pb-4">
          Create board
        </div>
        <Button
          onClick={() => setOpened(false)}
          variant="ghost"
          size="sm"
          className="h-auto w-auto absolute top-2 right-2 text-neutral-600 ring-0 
          shadow-none rounded-none border-none p-0 focus:ring-0"
        >
          <X className="w-4 h-4 " />
        </Button>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(new FormData(event.target as HTMLFormElement));
          }}
        >
          <div className="space-y-4">
            <FormPicker id="image" errors={result.validationError} />
            <FormInput
              id="title"
              label="Board title"
              type="text"
              fieldsError={result.validationError}
            />
            <FormSubmit className="w-full">Create</FormSubmit>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
};
