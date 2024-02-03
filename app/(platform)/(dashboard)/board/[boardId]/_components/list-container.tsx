'use client';

import { useEffect, useRef, useState } from 'react';
import { ListWithCards } from '@/types';
import { ListForm } from './list-form';
import { ListItem } from './list-item';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { v4 as uuid } from 'uuid';
import { useAction } from 'next-safe-action/hook';
import { reorderListAction } from '@/actions/update-list-order';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

type ListContainerProps = {
  data: Array<ListWithCards>;
  boardId: string;
};

function reorder<T>(list: T[], sourceIndex: number, targetIndex: number) {
  if (list.length < 2) return list;
  const updatedList = Array.from(list);
  const [removed] = updatedList.splice(sourceIndex, 1);
  updatedList.splice(targetIndex, 0, removed);
  return updatedList;
}

export const ListContainer = ({ data }: ListContainerProps) => {
  const [boardList, setBoardList] = useState(data);
  const router = useRouter();
  const { boardId } = useParams() as { boardId: string };

  const actionUpdateId = useRef<string | null>(null);

  const { execute: reorderList } = useAction(reorderListAction, {
    onSuccess: (data, { updateId }) => {
      if (updateId === actionUpdateId.current) {
        setBoardList(data);
        toast.success('List boarder reorder succesfully');
      }
    },
    onError: () => {
      setBoardList(data);
      toast.success('List boarder reorder failed');
    },

    onSettled: () => {
      router.refresh();
    },
  });

  const onDragEnd = ({ destination, source, type }: DropResult) => {
    if (
      !destination ||
      (source.droppableId === destination.droppableId &&
        source.index === destination.index)
    ) {
      return;
    }

    //user move a list
    if (type === 'list') {
      const reorderedList = reorder(
        boardList,
        source.index,
        destination.index
      ).map((item, index) => ({ ...item, order: index + 1 }));
      setBoardList(reorderedList);
      const updateId = uuid();
      actionUpdateId.current = updateId;
      reorderList({ boardId, items: reorderedList, updateId });
    }

    //user moves a card

    if (type === 'card') {
      let newOrderedData = [...boardList];
      const sourceList = newOrderedData.find(
        (list) => list.id === source.droppableId
      );
      const destinationList = newOrderedData.find(
        (list) => list.id === destination.droppableId
      );

      if (!(sourceList && destinationList)) {
        return;
      }

      //check if cards exist on the sourelist
      sourceList.cards ||= [];
      //check if cards exist on the destinationList
      destinationList.cards ||= [];

      //Moving the card in the same list

      if (sourceList === destinationList) {
        const reorderCards = reorder(
          sourceList.cards,
          source.index,
          destination.index
        ).map((item, index) => ({ ...item, order: index + 1 }));
        sourceList.cards = reorderCards;
        setBoardList(newOrderedData);

        //TODO trigger server action
      } else {
        //move the card to another list
        const [movedCard] = sourceList.cards.splice(source.index, 1);

        //assign the new listId to the mode card;
        movedCard.listId = destination.droppableId;

        destinationList.cards.splice(destination.index, 0, movedCard);
        //add card to the source list
        sourceList.cards &&= sourceList.cards.map((card, index) => ({
          ...card,
          order: index + 1,
        }));

        //update the order for each card in the destination list
        destinationList.cards &&= destinationList.cards.map((card, index) => ({
          ...card,
          order: index + 1,
        }));
      }
    }
  };
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="lists" type="list" direction="horizontal">
        {(provided) => (
          <ol
            {...provided}
            ref={provided.innerRef}
            className="flex gap-x-3 h-full"
          >
            {boardList.map((list, index) => (
              <ListItem key={list.id} index={index} list={list} />
            ))}
            {provided.placeholder}
            <ListForm />
          </ol>
        )}
      </Droppable>
    </DragDropContext>
  );
};
