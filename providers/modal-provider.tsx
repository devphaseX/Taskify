'use client';

import { CardModal } from '@/components/modals/card-modal';
import { useEffect, useState } from 'react';

export const ModalProvider = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return (
    <>
      <CardModal />
    </>
  );
};
