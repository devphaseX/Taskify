import { TypeOf, object, string } from 'zod';

const EnvSchema = object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string({
    required_error: 'Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY key',
  }),
  CLERK_SECRET_KEY: string({ required_error: 'Missing CLERK_SECRET_KEY' }),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: string({
    required_error: 'Missing NEXT_PUBLIC_CLERK_SIGN_IN_URL',
  }),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: string({
    required_error: 'Missing NEXT_PUBLIC_CLERK_SIGN_UP_URL',
  }),
  DATABASE_URL: string({ required_error: 'Missing DATABASE_URL' }),
  NEXT_PUBLIC_UNSPLASH_API_KEY: string({
    required_error: 'NEXT_PUBLIC_UNSPLASH_API_KEY is missing',
  }),
  STRIPE_API_KEY: string({
    required_error: 'STRIPE_API_KEY is missing',
  }),
  NEXT_PUBLIC_APP_URL: string({
    required_error: 'NEXT_PUBLIC_APP_URL is missing',
  }),
  STRIPE_WEBHOOK_SECRET: string({
    required_error: 'STRIPE_WEBHOOK_SECRET is missing',
  }),
});

export type ParsedEnv = TypeOf<typeof EnvSchema>;
export const parsedEnv = EnvSchema.parse(process.env);
