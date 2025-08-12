import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URI: z.string().min(1),
    PAYLOAD_SECRET: z.string().min(1),
    RESEND_API_KEY: z.string().min(1).optional(),
    RESEND_SENDER_EMAIL: z.string().optional(),
    RESEND_SENDER_NAME: z.string().min(1).optional(),
    STRIPE_SECRET_KEY: z.string().min(1).optional(),
    STRIPE_WEBHOOKS_ENDPOINT_SECRET: z.string().min(1).optional(),
  },
  client: {
    NEXT_PUBLIC_WEBSITE_URL: z.url(),
    NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN: z.string().optional(),
    NEXT_PUBLIC_DISCORD_INVITE_URL: z.string().optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_WEBSITE_URL: process.env.NEXT_PUBLIC_WEBSITE_URL,
    NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN: process.env.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN,
    NEXT_PUBLIC_DISCORD_INVITE_URL: process.env.NEXT_PUBLIC_DISCORD_INVITE_URL,
    DATABASE_URI: process.env.DATABASE_URI,
    PAYLOAD_SECRET: process.env.PAYLOAD_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_SENDER_EMAIL: process.env.RESEND_SENDER_EMAIL,
    RESEND_SENDER_NAME: process.env.RESEND_SENDER_NAME,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOKS_ENDPOINT_SECRET: process.env.STRIPE_WEBHOOKS_ENDPOINT_SECRET,
  },
  emptyStringAsUndefined: true,
  skipValidation: !!process.env.SKIP_VALIDATION,
})
