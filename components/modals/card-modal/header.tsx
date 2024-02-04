'use client';

import { UpdateCardAction, UpdateCardInput } from '@/actions/card';
import { FormInput } from '@/components/form/form-input';
import { Skeleton } from '@/components/ui/skeleton';
import { CardWithList } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { Layout } from 'lucide-react';
import { useAction } from 'next-safe-action/hook';
import { useParams } from 'next/navigation';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

type HeaderProps = {
  data: CardWithList;
};
export const Header = ({ data }: HeaderProps) => {
  const [cardTitle, setCardTitle] = useState(data.title);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { boardId } = useParams() as { boardId: string };

  const onBlur = () => {
    inputRef.current?.form?.requestSubmit();
  };

  const onSubmit = (formData: FormData) => {
    const formState = Object.fromEntries(formData) as UpdateCardInput;
    if (!(cardTitle == formState.title)) {
      updateCard(formState);
    }
  };

  const queryClient = useQueryClient();

  const { execute: updateCard, result } = useAction(UpdateCardAction, {
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['card', data.id] });
      toast.success(`Renamed to "${data.title}"`);
      setCardTitle(data.title);
    },
    onError: ({ serverError }) => {
      serverError && toast.error(serverError);
    },
  });

  return (
    <div className="flex items-start gap-x-3 mb-6 w-full">
      <Layout className="w-5 h-5 mt-1 text-neutral-700" />
      <div className="w-full">
        <form action={onSubmit}>
          <FormInput
            id="title"
            defaultValue={cardTitle}
            inputRef={inputRef}
            onBlur={onBlur}
            fieldsError={result.validationError}
            className="font-semibold text-xl px-1 text-neutral-700
                bg-transparent border-transparent relative -left-1.5 w-[95%] focus-visible:bg-white 
                focus-visible:border-input mb-0.5 truncate
            "
          />
          <input className="hidden" id="id" name="id" value={data.id} />
          <input
            className="hidden"
            id="boardId"
            name="boardId"
            value={boardId}
          />
        </form>
        <p className="text-sm text-muted-foreground">
          In list <span className="underline">{data.list.title}</span>
        </p>
      </div>
    </div>
  );
};

Header.Skeleton = function () {
  return (
    <div className="flex items-start gap-x-3 mb-6">
      <Skeleton className="h-6 w-6 mt-1 bg-neutral-200" />
      <div>
        <Skeleton className="w-24 h-6 mb-1 bg-neutral-200" />
        <Skeleton className="w-12 h-4 mb-1 bg-neutral-200" />
      </div>
    </div>
  );
};
