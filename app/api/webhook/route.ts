import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { db } from '@/lib/schema/db';
import Stripe from 'stripe';
import { parsedEnv } from '@/config/env';
import { orgSubscription } from '@/lib/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature') as string;

  // console.log({ body });
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      parsedEnv.STRIPE_WEBHOOK_SECRET
    );

    const session = event.data.object as Stripe.Checkout.Session;

    console.log({ meta: session?.metadata });
    if (!session?.metadata?.orgId) {
      return new NextResponse('Org Id is required', { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      if (!session?.metadata?.orgId) {
        return new NextResponse('Org Id is required', { status: 400 });
      }

      await db.insert(orgSubscription).values({
        orgId: session.metadata.orgId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0].price.id,
        subscriptionEndPeriod: new Date(subscription.current_period_end * 1000),
      });
    }
    if (event.type === 'invoice.payment_succeeded') {
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );
      await db
        .insert(orgSubscription)
        .values({
          orgId: session.metadata.orgId,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          stripePriceId: subscription.items.data[0].price.id,
          subscriptionEndPeriod: new Date(
            subscription.current_period_end * 1000
          ),
        })
        .onConflictDoUpdate({
          set: {
            stripePriceId: subscription.items.data[0].price.id,
            subscriptionEndPeriod: new Date(
              subscription.current_period_end * 1000
            ),
          },
          target: [
            orgSubscription.orgId,
            orgSubscription.stripeSubscriptionId,
            orgSubscription.stripePriceId,
          ],
          where: eq(orgSubscription.orgId, session.metadata.orgId as string),
        });
    }
    return new NextResponse(null, { status: 200 });
  } catch (e) {
    console.log({ e });
    return new NextResponse('Webhook error', { status: 400 });
  }
}
