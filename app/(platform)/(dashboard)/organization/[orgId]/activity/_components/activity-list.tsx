import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { db } from '@/lib/schema/db';
import { Skeleton } from '@/components/ui/skeleton';
import { auditLog } from '@/lib/schema';
import { desc, sql } from 'drizzle-orm';
import { ActivityItem } from '@/components/modals/card-modal/activity-item';

export const ActivityList = async () => {
  const { orgId } = auth();
  if (!orgId) {
    return redirect('/select-org');
  }

  const auditLogs = await db
    .select()
    .from(auditLog)
    .where(sql`${auditLog.orgId} = ${orgId}`)
    .orderBy(desc(auditLog.createdAt));

  return (
    <ol className="space-y-4 my-4">
      <p className="hidden last:block text-xs  text-center text-muted-foreground">
        No activity found inside this organization
      </p>
      {auditLogs.map((log) => (
        <ActivityItem key={log.id} data={log} />
      ))}
    </ol>
  );
};

ActivityList.Skeleton = function ActivitySkeleton() {
  return (
    <ol className="space-y-4 mt-4">
      <Skeleton className="w-[80%] h-14" />
      <Skeleton className="w-[50%] h-14" />
      <Skeleton className="w-[70%] h-14" />
      <Skeleton className="w-[80%] h-14" />
      <Skeleton className="w-[75%] h-14" />
    </ol>
  );
};
