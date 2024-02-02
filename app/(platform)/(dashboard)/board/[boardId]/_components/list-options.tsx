import { List } from '@/lib/schema';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import { FormSubmit } from '@/components/form/form-submit';
import { Separator } from '@/components/ui/separator';
import { useAction } from 'next-safe-action/hook';
import { DeleteListInput, deleteListAction } from '@/actions/list';
import { toast } from 'sonner';
type ListOptionsProps = {
  data: List;
  onAddCard: () => void;
};

export const ListOptions = ({ data, onAddCard }: ListOptionsProps) => {
  const [opened, setOpened] = useState(false);
  const { execute: deleteList } = useAction(deleteListAction, {
    onSuccess: (data) => {
      toast.success(`List "${data.title}" deleted`);
    },

    onError: ({ serverError }) => {
      toast.error(serverError);
    },
  });
  return (
    <Popover open={opened} onOpenChange={setOpened}>
      <PopoverTrigger asChild>
        <Button className="h-auto w-auto p-2" variant="ghost">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="px-0 py-3" side="bottom" align="start">
        <div className="text-sm font-medium text-center text-neutral-600 pb-4">
          List actions
        </div>
        <Button
          variant="transparent"
          asChild
          className="h-auto w-auto p-2 absolute top-2 right-2 text-neutral-600"
          onClick={() => setOpened(false)}
        >
          <X className="w-4 h-4" />
        </Button>
        <Button
          onClick={onAddCard}
          className="rounded-none w-full h-auto p-2 px-5 justify-start font-normal
        text-sm"
          variant="ghost"
        >
          Add Card...
        </Button>
        <form>
          <input hidden name="id" id="id" value={data.id} />
          <input hidden name="boardId" id="boardId" value={data.boardId} />
          <FormSubmit
            variant="ghost"
            className="ounded-none w-full h-auto p-2 px-5 justify-start font-normal
        text-sm"
          >
            Copy List...
          </FormSubmit>
        </form>
        <Separator />
        <form
          action={(formData) => {
            deleteList(Object.fromEntries(formData) as DeleteListInput);
          }}
        >
          <input hidden name="id" id="id" value={data.id} />
          <input hidden name="boardId" id="boardId" value={data.boardId} />
          <FormSubmit
            variant="ghost"
            className="ounded-none w-full h-auto p-2 px-5 justify-start font-normal
        text-sm"
          >
            Delete List...
          </FormSubmit>
        </form>
      </PopoverContent>
    </Popover>
  );
};
