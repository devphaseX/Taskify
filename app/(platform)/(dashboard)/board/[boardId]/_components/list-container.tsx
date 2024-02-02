'use client';

import { useEffect, useState } from 'react';
import { ListWithCards } from '@/types';
import { ListForm } from './list-form';
import { ListItem } from './list-item';

type ListContainerProps = {
  data: Array<ListWithCards>;
  boardId: string;
};

export const ListContainer = ({ boardId, data }: ListContainerProps) => {
  const [boardList, setBoardList] = useState(data);

  useEffect(() => {
    setBoardList(data);
  }, [data]);
  return (
    <ol className="flex gap-x-3 h-full">
      {boardList.map((list, index) => (
        <ListItem key={list.id} index={index} list={list} />
      ))}
      <ListForm />
    </ol>
  );
};
