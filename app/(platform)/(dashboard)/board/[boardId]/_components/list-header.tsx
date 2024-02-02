'use client';

import { UpdateListInput, updateListAction } from '@/actions/list';
import { FormInput } from '@/components/form/form-input';
import { List } from '@/lib/schema';
import { useAction } from 'next-safe-action/hook';
import { MutableRefObject, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useEventListener } from 'usehooks-ts';
import { ListOptions } from './list-options';

type ListHeaderProps = {
  data: List;
};
export const ListHeader = ({ data }: ListHeaderProps) => {
  const [title, setTitle] = useState(data.title);
  const [editing, setEditing] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const enableEditing = () => {
    setEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  };

  const disableEditing = () => {
    setEditing(false);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key.toLowerCase() === 'escape') {
      formRef.current?.requestSubmit();
    }
  };

  useEventListener('keydown', onKeyDown);

  const { execute: updateListTitle } = useAction(updateListAction, {
    onSuccess: (data) => {
      toast.success(`Renamed to "${data.title}"`);
      setTitle(data.title);
      disableEditing();
    },
    onError: ({ serverError }) => {
      toast.error(serverError);
    },
  });

  const handleSubmit = (form: FormData) => {
    const formState = Object.fromEntries(form) as UpdateListInput;
    if (formState.title === data.title) {
      return disableEditing();
    }
    updateListTitle(formState);
  };

  return (
    <div
      className="pt-2 px-2 text-sm font-semibold flex justify-between
  items-start gap-x-2"
    >
      {editing ? (
        <form action={handleSubmit} className="flex-1 px-[2px]" ref={formRef}>
          <input hidden id="id" name="id" value={data.id} />
          <input hidden id="boardId" name="boardId" value={data.boardId} />
          <FormInput
            inputRef={inputRef as MutableRefObject<HTMLInputElement>}
            id="title"
            onBlur={() => {
              formRef.current?.requestSubmit();
            }}
            placeholder="Enter list title"
            defaultValue={title}
            className="text-sm px-[7px] py-1 h-7 font-medium 
            border-transparent hover:border-input focus:border-input transition truncate bg-transparent focus:bg-white"
          />
        </form>
      ) : (
        <div
          onClick={enableEditing}
          className="w-full text-sm px-2.5 py-1 h-7 font-medium border-transparent"
        >
          {title}
        </div>
      )}

      <ListOptions data={data} onAddCard={() => {}} />
    </div>
  );
};
