'use client';

import { useCardModal } from '@/hooks/use-card-modal';
import { Card } from '@/lib/schema';
import { Draggable } from '@hello-pangea/dnd';

type CardItemProps = {
  data: Card;
  index: number;
};

export const CardItem = ({ data, index }: CardItemProps) => {
  const openModal = useCardModal((state) => state.onOpen);
  return (
    <Draggable draggableId={data.id} index={index}>
      {({ innerRef, ...provided }) => (
        <div
          {...provided.dragHandleProps}
          {...provided.draggableProps}
          onClick={() => openModal(data.id)}
          ref={innerRef}
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
