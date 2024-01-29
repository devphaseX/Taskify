'use client';
import Link from 'next/link';
import { Plus } from 'lucide-react';

import { useLocalStorage } from 'usehooks-ts';
import { useOrganization, useOrganizationList } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion } from '@/components/ui/accordion';
import { SideBarItem } from './sidebar-item';

type SidebarProps = {
  storageKey?: string;
};

export const Sidebar: React.FC<SidebarProps> = ({
  storageKey = 't-sidebar-state',
}) => {
  const [expanded, setExpanded] = useLocalStorage<Record<string, boolean>>(
    storageKey,
    {}
  );

  const { organization: activeOrganization, isLoaded: orgLoaded } =
    useOrganization();

  const { userMemberships, isLoaded: listLoaded } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });

  const expandedAccordions = Object.entries(expanded ?? {})
    .filter(([_, value]) => value)
    .map(([key]) => key);

  const onExpand = (id: string) => {
    setExpanded((curr) => ({
      ...curr,
      [id]: !(curr[id] ?? false),
    }));
  };

  if (!(orgLoaded || listLoaded) || userMemberships.isLoading) {
    return (
      <>
        <Skeleton />
      </>
    );
  }
  return (
    <>
      <div className="font-medium text-xs flex items-center mb-1">
        <span className="pl-4">Workspaces</span>
        <Button
          asChild
          type="button"
          size="icon"
          variant="ghost"
          className="ml-auto"
        >
          <Link href="/select-org">
            <Plus className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <Accordion
        type="multiple"
        defaultValue={expandedAccordions}
        className="space-y-2"
      >
        {userMemberships.data?.map(({ organization }) => (
          <SideBarItem
            key={organization.id}
            organization={organization}
            active={organization.id === activeOrganization?.id}
            expanded={!!expanded[organization.id]}
            onExpand={onExpand}
          />
        ))}
      </Accordion>
    </>
  );
};
