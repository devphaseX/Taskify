'use client';

import { ListWithCards } from '@/types';
import { ListHeader } from './list-header';
import { useRef, useState } from 'react';
import { CardForm } from './card-form';
import { cn } from '@/lib/utils';
import { CardItem } from './card-item';
import { Draggable, Droppable } from '@hello-pangea/dnd';

type ListItemProps = {
  index: number;
  list: ListWithCards;
};
export const ListItem = ({ list, index }: ListItemProps) => {
  const [editing, setEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const disableEdit = () => {
    setEditing(false);
  };

  const enableEdit = () => {
    setEditing(true);
    setTimeout(() => {
      textareaRef.current?.focus();
    });
  };

  return (
    <Draggable draggableId={list.id} index={index}>
      {(provided) => (
        <li
          {...provided.draggableProps}
          ref={provided.innerRef}
          className="shrink-0 h-full w-[272px] select-none"
        >
          <div
            {...provided.dragHandleProps}
            className="w-full rounded-md bg-[#f1f2f4] shadow-md pb-2"
          >
            <ListHeader data={list} onAddCard={enableEdit} />
            <Droppable droppableId={list.id} type="card">
              {({ innerRef, ...provided }) => (
                <ol
                  ref={innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    'mx-1 px-1 py-0.5 flex flex-col gap-y-2',
                    list.cards.length === 0 ? 'mt-2' : 'mt-0'
                  )}
                >
                  {list.cards.map((card, index) => (
                    <CardItem key={card.id} index={index} data={card} />
                  ))}
                  {provided.placeholder}
                </ol>
              )}
            </Droppable>
            <CardForm
              listId={list.id}
              textareaRef={textareaRef}
              editing={editing}
              enableEdit={enableEdit}
              disableEdit={disableEdit}
            />
          </div>
        </li>
      )}
    </Draggable>
  );
};
