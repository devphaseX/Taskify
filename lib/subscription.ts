import { auth } from '@clerk/nextjs';
import { orgSubscription } from './schema';
import { eq, getTableColumns } from 'drizzle-orm';

const DAY_IN_MS = 84_000_000;

export async function checkSubscriptionStatus() {
  const { orgId } = auth();

  if (!orgId) return false;
  const {
    subscriptionEndPeriod,
    stripeSubscriptionId,
    stripeCustomerId,
    stripePriceId,
  } = getTableColumns(orgSubscription);

  const [subscription] = await db
    .select({
      subscriptionEndPeriod,
      stripeSubscriptionId,
      stripeCustomerId,
      stripePriceId,
    })
    .from(orgSubscription)
    .where(eq(orgSubscription.orgId, orgId));

  if (!subscription) return false;

  const subscriptionActive = !!(
    subscription.stripeSubscriptionId &&
    (subscription.subscriptionEndPeriod?.getTime() ?? 0 + DAY_IN_MS) >
      Date.now()
  );

  return subscriptionActive;
}
