'use client';
import { deleteBoardAction } from '@/actions/board';
import { Button } from '@/components/ui/button';

type BoardProps = {
  id: string;
  title: string;
};

const Board = ({ id, title }: BoardProps) => {
  return (
    <form
      className="flex items-center gap-x-2"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.target as HTMLFormElement);
        const id = form.get('id') as string;
        deleteBoardAction({ id });
      }}
    >
      <input name="id" value={id} hidden />
      <p>Board title: {title}</p>
      <Button variant="destructive" size="sm" type="submit">
        Delete
      </Button>
    </form>
  );
};

export { Board };
