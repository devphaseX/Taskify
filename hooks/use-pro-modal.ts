import { create } from 'zustand';

type ProModalStore = {
  opened?: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useProModal = create<ProModalStore>((set) => ({
  opened: false,
  onOpen: () => set({ opened: true }),
  onClose: () => set({ opened: false }),
}));
