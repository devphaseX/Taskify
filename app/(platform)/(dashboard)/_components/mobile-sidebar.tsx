'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useMobileSidebar } from '@/hooks/use-mobile-sidebar';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sidebar } from './sidebar';
import { Menu } from 'lucide-react';

export const MobileSidebar = () => {
  const onOpen = useMobileSidebar((state) => state.onOpen);
  const onClose = useMobileSidebar((state) => state.onClose);
  const opened = useMobileSidebar((state) => state.opened);

  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  if (!mounted) return null;

  return (
    <>
      <Button
        onClick={onOpen}
        className="md:hidden block mr-2"
        variant="ghost"
        size="sm"
      >
        <Menu className="h-4 w-4" />
      </Button>
      <Sheet open={opened} onOpenChange={onClose}>
        <SheetContent side="left" className="p-2 pt-10">
          <Sidebar storageKey="t-siderbar-mobile-state" />
        </SheetContent>
      </Sheet>
    </>
  );
};
