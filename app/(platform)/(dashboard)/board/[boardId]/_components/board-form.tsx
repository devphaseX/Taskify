'use client';

import { updateBoardAction } from '@/actions/board';
import { FormInput } from '@/components/form/form-input';
import { Button } from '@/components/ui/button';
import { Board } from '@/lib/schema';
import { useAction } from 'next-safe-action/hook';
import {
  ElementRef,
  MutableRefObject,
  useCallback,
  useRef,
  useState,
} from 'react';
import { toast } from 'sonner';

type BoardFormProps = {
  data: Board;
};

export const BoardForm = ({ data }: BoardFormProps) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<ElementRef<'input'>>();
  const [boardTitle, setBoardTitle] = useState(data.title);

  const { execute } = useAction(updateBoardAction, {
    onSuccess: (data) => {
      toast.success(`Board ${data.title} updated`);
      disableEditing();
    },
    onError: ({ serverError }) => {
      setBoardTitle(data.title);
      toast.error(serverError);
    },
  });

  const enableEditing = useCallback(() => {
    //TODO :focus input
    setEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  }, []);

  const disableEditing = useCallback(() => {
    setEditing(false);
  }, []);

  const onBlur = useCallback(() => {
    inputRef.current?.form?.requestSubmit();
  }, []);

  const onSubmit = (form: FormData) => {
    const formObject = Object.fromEntries(form) as { title: string };
    setBoardTitle(formObject.title);
    execute({ ...formObject, id: data.id });
  };

  if (editing) {
    return (
      <form className="flex items-center gap-x-2" action={onSubmit}>
        <FormInput
          id="title"
          inputRef={inputRef as MutableRefObject<HTMLInputElement>}
          onBlur={onBlur}
          defaultValue={boardTitle}
          className="text-lg font-bold px-[7px] py-1
           bg-transparent focus-visible:outline-none focus-visible:ring-transparent border-none"
        />
      </form>
    );
  }

  return (
    <Button
      onClick={enableEditing}
      variant="transparent"
      className="font-bold text-lg h-auto w-auto p-1 px-2"
    >
      {boardTitle}
    </Button>
  );
};
