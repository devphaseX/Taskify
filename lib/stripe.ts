import { parsedEnv } from '@/config/env';
import { Stripe } from 'stripe';

export const stripe = new Stripe(parsedEnv.STRIPE_API_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
});
