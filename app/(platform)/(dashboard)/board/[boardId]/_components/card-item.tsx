'use client';

import { Card } from '@/lib/schema';
import { Draggable } from '@hello-pangea/dnd';

type CardItemProps = {
  data: Card;
  index: number;
};

export const CardItem = ({ data, index }: CardItemProps) => {
  return (
    <Draggable draggableId={data.id} index={index}>
      {(provided) => (
        <div
          {...provided.dragHandleProps}
          {...provided.draggableProps}
          ref={provided.innerRef}
          className="truncate border-2 border-transparent hover:border-black
        py-2 px-3 text-sm bg-white rounded-md shadow-sm
    "
        >
          {data.title}
        </div>
      )}
    </Draggable>
  );
};
