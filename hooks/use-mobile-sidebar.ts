import { create } from 'zustand';

type MobileSidebarStore = {
  opened?: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useMobileSidebar = create<MobileSidebarStore>((set) => ({
  opened: false,
  onOpen: () => set({ opened: true }),
  onClose: () => set({ opened: false }),
}));
