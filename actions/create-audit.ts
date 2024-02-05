import { actionEnum, auditLog, entityTypeEnum } from '@/lib/schema';
import { auth, currentUser } from '@clerk/nextjs';
import { createInsertSchema } from 'drizzle-zod';
import { TypeOf, string, z } from 'zod';
import { db } from '@/lib/schema/db';

const CreateAuditSchema = createInsertSchema(auditLog, {
  entityId: string().uuid(),
  entityTitle: string().min(3, { message: 'entityTitle too short' }).max(256, {
    message: 'entityTitle too long, More than 256 characters',
  }),
  entityType: z.enum(entityTypeEnum.enumValues),
  action: z.enum(actionEnum.enumValues),
})
  .required({
    entityId: true,
    entityTitle: true,
    action: true,
    entityType: true,
  })
  .pick({ entityId: true, entityTitle: true, action: true, entityType: true });

type CreateAuditInput = TypeOf<typeof CreateAuditSchema>;

export const createAuditLog = async ({ data }: { data: CreateAuditInput }) => {
  const { orgId, userId } = auth();
  const user = await currentUser();

  if (!userId) {
    throw new Error('User not authenenicated');
  }

  if (!orgId) {
    throw new Error('Board can only be created by organization');
  }
  try {
    const { entityId, entityTitle, entityType, action } = data;
    await db.insert(auditLog).values({
      orgId,
      entityId,
      entityTitle,
      entityType,
      action,
      userId,
      userImage: user?.imageUrl,
      userName:
        `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() ?? null,
    });
  } catch (e) {
    console.log('[audit log error]', e);
    throw e;
  }
};
