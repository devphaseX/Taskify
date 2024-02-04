import { create } from 'zustand';

type CardModalStore = {
  id?: string | null;
  opened?: boolean;
  onOpen: (id: string) => void;
  onClose: () => void;
};

export const useCardModal = create<CardModalStore>((set) => ({
  id: null,
  opened: false,
  onOpen: (id) => set({ opened: true, id }),
  onClose: () => set({ opened: false, id: null }),
}));
