'use client';

import { Plus, X } from 'lucide-react';
import { ListWrapper } from './list-wrapper';
import {
  useState,
  useRef,
  RefObject,
  ElementRef,
  MutableRefObject,
} from 'react';
import { useEventListener, useOnClickOutside } from 'usehooks-ts';
import { FormInput } from '@/components/form/form-input';
import { useParams } from 'next/navigation';
import { FormSubmit } from '@/components/form/form-submit';
import { Button } from '@/components/ui/button';
import { useAction } from 'next-safe-action/hooks';
import { CreateListInput, createListAction } from '@/actions/list';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export const ListForm = () => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>();
  const formRef = useRef<HTMLFormElement>();
  const { boardId } = useParams() as { boardId: string };
  const router = useRouter();
  const {
    execute: createList,
    reset,
    result,
  } = useAction(createListAction, {
    onSuccess: (data) => {
      toast.success(`List "${data.title}" created`);
      disableEdit();
      router.refresh();
      reset();
    },
  });

  const enableEdit = () => {
    setEditing(true);

    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  };

  const disableEdit = () => {
    setEditing(false);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key.toLowerCase() === 'escape') {
      disableEdit();
    }
  };

  useEventListener('keydown', onKeyDown);
  useOnClickOutside(formRef as RefObject<HTMLFormElement>, disableEdit);

  const onSubmit = (formData: FormData) => {
    const formState = Object.fromEntries(
      formData
    ) as unknown as CreateListInput;

    createList(formState);
  };

  if (editing) {
    return (
      <ListWrapper>
        <form
          ref={formRef as RefObject<HTMLFormElement>}
          className="w-full p-3 rounded-md bg-white space-y-4 shadow-md"
          action={onSubmit}
        >
          <FormInput
            inputRef={inputRef as MutableRefObject<HTMLInputElement>}
            id="title"
            className="text-sm px-2 py-1 h-7 font-medium
             border-transparent hover:border-input focus:border-input transition"
            placeholder="Enter list title..."
            fieldsError={result.validationErrors}
          />
          <input hidden value={boardId} name="boardId" />
          <div className="flex items-center gap-x-1">
            <FormSubmit>Add List</FormSubmit>
            <Button onClick={disableEdit} size="sm" variant="ghost">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </form>
      </ListWrapper>
    );
  }
  return (
    <ListWrapper>
      <button
        onClick={enableEdit}
        className="w-full rounded-md bg-white/80 hover:bg-white/50 transition
        p-3 flex items-center font-medium text-sm"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add a list
      </button>
    </ListWrapper>
  );
};
