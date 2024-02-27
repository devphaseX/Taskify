'use client';

import { UpdateCardAction } from '@/actions/card';
import { FormTextarea } from '@/app/(platform)/(dashboard)/board/[boardId]/_components/form-textarea';
import { FormSubmit } from '@/components/form/form-submit';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CardWithList } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { AlignLeft } from 'lucide-react';
import { useAction } from 'next-safe-action/hook';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useEventListener, useOnClickOutside } from 'usehooks-ts';

type DescriptionProps = {
  data: CardWithList;
};

export const Description = ({ data }: DescriptionProps) => {
  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState(data.description);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const queryClient = useQueryClient();
  const params = useParams() as { boardId: string };

  const enableEdit = () => {
    setEditing(true);
    setTimeout(() => {
      textareaRef.current?.focus();
    });
  };

  const disableEdit = () => {
    setEditing(false);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key?.toLowerCase() === 'escape') {
      disableEdit();
    }
  };

  useEventListener('keydown', onKeyDown);
  useOnClickOutside(formRef, disableEdit);
  const onSubmit = (formData: FormData) => {
    const description = formData.get('description') as string;
    const boardId = params.boardId;
    const id = data.id;
    updateCard({ id, boardId, description });
  };

  const { execute: updateCard, result } = useAction(UpdateCardAction, {
    onSuccess: (data, _, reset) => {
      queryClient.invalidateQueries({ queryKey: ['card', data.id] });
      queryClient.invalidateQueries({ queryKey: ['card-log', data.id] });

      toast.success(`Card "${data.title}" updated`);
      setDescription(data.description);
      reset();
      disableEdit();
    },
    onError: ({ serverError }) => {
      serverError && toast.error(serverError);
    },
  });

  return (
    <div className="flex items-start gap-x-3 w-full">
      <AlignLeft className="h-5 w-5 mt-0.5 text-neutral-700" />
      <div className="w-full">
        <p className="font-semibold text-neutral-700 mb-2">Description</p>
        {editing ? (
          <form action={onSubmit} ref={formRef} className="space-y-2">
            <FormTextarea
              id="description"
              className="w-full mt-2"
              textareaRef={textareaRef}
              placeholder="Add a more detailed description"
              defaultValue={data.description ?? undefined}
              errors={result.validationError}
            />
            <div className="flex items-center gap-x-2">
              <FormSubmit>Save</FormSubmit>
              <Button
                onClick={disableEdit}
                type="button"
                size="sm"
                variant="ghost"
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div
            role="button"
            className="min-h-[78px] bg-neutral-200 text-sm 
          font-medium py-3 px-3.5 rounded-md"
            onClick={enableEdit}
          >
            {description ?? 'Add a more detailed description...'}
          </div>
        )}
      </div>
    </div>
  );
};

Description.Skeleton = function () {
  return (
    <div className="flex items-start gap-x-3 w-full">
      <Skeleton className="h-6 w-6 bg-neutral-200" />
      <div className="w-full">
        <Skeleton className="w-24 h-6 mb-2 bg-neutral-200" />
        <Skeleton className="w-full h-[78px] mb-2 bg-neutral-200" />
      </div>
    </div>
  );
};
