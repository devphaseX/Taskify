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
});

export type ParsedEnv = TypeOf<typeof EnvSchema>;
export const parsedEnv = EnvSchema.parse(process.env);
