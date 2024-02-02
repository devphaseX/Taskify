'use client';
import { Board } from '@/lib/schema';
import { BoardForm } from './board-form';
import { BoardOptions } from './board-options';

type BoardNavbarProps = {
  id: string;
  board: Board;
};

export const BoardNavbar = ({ id, board }: BoardNavbarProps) => {
  return (
    <div
      className="w-full h-14 z-[40] bg-black/50 absolute top-14 flex
  items-center px-6 gap-x-4 text-white"
    >
      <BoardForm data={board} />
      <div className="ml-auto">
        <BoardOptions id={board.id} />
      </div>
    </div>
  );
};
