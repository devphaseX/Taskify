import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import {
  KeyboardEventHandler,
  MutableRefObject,
  useEffect,
  useRef,
} from 'react';
import { FormTextarea } from './form-textarea';
import { Input } from '@/components/ui/input';
import { FormSubmit } from '@/components/form/form-submit';
import { useParams } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { CreateCardInput, createCardAction } from '@/actions/card';
import { toast } from 'sonner';
import { useEventListener, useOnClickOutside } from 'usehooks-ts';

type CardFormProps = {
  listId: string;
  editing: boolean;
  enableEdit: () => void;
  disableEdit: () => void;
  textareaRef?: MutableRefObject<HTMLTextAreaElement | null>;
};

export const CardForm = ({
  editing,
  enableEdit,
  disableEdit,
  textareaRef,
  listId,
}: CardFormProps) => {
  const { boardId } = useParams() as { boardId: string };
  const formRef = useRef<HTMLFormElement | null>(null);
  const {
    execute: createCard,
    result,
    status,
  } = useAction(createCardAction, {
    onSuccess: (data) => {
      toast.success(`Card "${data.title}" created.`);
      disableEdit();
    },
    onError: ({ serverError }) => {
      serverError && toast.error(serverError);
    },
  });

  const onSubmit = (formData: FormData) => {
    createCard(Object.fromEntries(formData) as unknown as CreateCardInput);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key?.toLowerCase() === 'escape') {
      disableEdit();
    }
  };

  useOnClickOutside(formRef, disableEdit);
  useEventListener('keydown', onKeyDown);

  const onTextareaKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key?.toLowerCase() === 'enter' && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  useEffect(() => {
    if (!editing) {
      formRef.current?.reset();
    }
  }, [editing]);

  if (editing) {
    return (
      <form
        ref={formRef}
        action={onSubmit}
        className="m-1 py-0.5 px-1 space-y-4"
      >
        <FormTextarea
          id="title"
          onKeyDown={onTextareaKeyDown}
          textareaRef={textareaRef}
          placeholder="Enter a title for this card..."
          errors={result.validationErrors}
        />
        <Input
          hidden
          id="listId"
          name="listId"
          value={listId}
          className="hidden"
        />
        <Input
          hidden
          id="boardId"
          name="boardId"
          value={boardId}
          className="hidden"
        />
        <div className="flex items-center gap-x-1">
          <FormSubmit>Add card</FormSubmit>
          <Button
            onClick={disableEdit}
            size="sm"
            variant="ghost"
            disabled={status === 'executing'}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </form>
    );
  }
  return (
    <div className="pt-2 px-2">
      <Button
        onClick={enableEdit}
        className="h-auto px-2 py-1.5 w-full
         justify-start text-muted-foreground text-sm"
        size="sm"
        variant="ghost"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add a card
      </Button>
    </div>
  );
};
