'use server';

import { serverAction } from '@/lib/action';
import { orgSubscription } from '@/lib/schema';
import { stripe } from '@/lib/stripe';
import { absoluteUrl } from '@/lib/utils';
import { auth, currentUser } from '@clerk/nextjs';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { TypeOf, z } from 'zod';
import { db } from '@/lib/schema/db';

const StripeRedirect = z.object({});
type StripeRedirectInput = TypeOf<typeof StripeRedirect>;

export const stripeRedirectAction = serverAction(StripeRedirect, async () => {
  try {
    const { userId, orgId } = auth();
    const user = await currentUser();

    if (!(userId && orgId && user)) {
      throw new Error('Unauthorized');
    }

    const settingsUrl = absoluteUrl(`/organization/${orgId}`);
    let url = '';
    const [subscription] = await db
      .select()
      .from(orgSubscription)
      .where(eq(orgSubscription.orgId, orgId));

    if (subscription && subscription.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: subscription.stripeCustomerId,
        return_url: settingsUrl,
      });

      url = stripeSession.url;
    } else {
      const stripeSession = await stripe.checkout.sessions.create({
        success_url: settingsUrl,
        cancel_url: settingsUrl,
        payment_method_types: ['card'],
        mode: 'subscription',
        billing_address_collection: 'auto',
        customer_email: user.emailAddresses[0]?.emailAddress,
        line_items: [
          {
            price_data: {
              currency: 'USD',
              product_data: {
                name: 'Taskify Pro',
                description: 'Unlimited boards for your organization',
              },
              unit_amount: 2000,
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          orgId,
        },
      });

      url = stripeSession.url || '';
      revalidatePath(`/organization/${orgId}`);
    }
    return {
      data: url,
    };
  } catch (e) {
    console.log('[STRIPE_REDIRECT]', e);
    throw new Error('Something went wrong');
  }
});
