import "server-only";
import { z } from "zod";

const coreEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
});

const stripeEnvSchema = z.object({
  STRIPE_SECRET_KEY: z.string().min(1),
});

const stripeWebhookSchema = z.object({
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
});

const adminEnvSchema = z.object({
  ADMIN_USERNAME: z.string().min(1),
  ADMIN_PASSWORD: z.string().min(1),
});

let cachedCoreEnv: z.infer<typeof coreEnvSchema> | null = null;
let cachedStripeEnv: z.infer<typeof stripeEnvSchema> | null = null;
let cachedWebhookEnv: z.infer<typeof stripeWebhookSchema> | null = null;
let cachedAdminEnv: z.infer<typeof adminEnvSchema> | null = null;

function flattenIssues(issues: z.ZodIssue[]) {
  return issues.map((issue) => issue.path.join(".") || issue.message).join(", ");
}

export function getCoreEnv() {
  if (cachedCoreEnv) return cachedCoreEnv;

  const parsed = coreEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      `Invalid server environment variables: ${flattenIssues(parsed.error.issues)}`
    );
  }

  cachedCoreEnv = parsed.data;
  return cachedCoreEnv;
}

export function getStripeEnv() {
  if (cachedStripeEnv) return cachedStripeEnv;

  const parsed = stripeEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      `Invalid Stripe environment variables: ${flattenIssues(parsed.error.issues)}`
    );
  }

  cachedStripeEnv = parsed.data;
  return cachedStripeEnv;
}

export function getStripeWebhookEnv() {
  if (cachedWebhookEnv) return cachedWebhookEnv;

  const parsed = stripeWebhookSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      `Invalid Stripe webhook environment variables: ${flattenIssues(parsed.error.issues)}`
    );
  }

  cachedWebhookEnv = parsed.data;
  return cachedWebhookEnv;
}

export function getAdminEnv() {
  if (cachedAdminEnv) return cachedAdminEnv;

  const parsed = adminEnvSchema.safeParse(process.env);
  if (!parsed.success) return null;

  cachedAdminEnv = parsed.data;
  return cachedAdminEnv;
}
