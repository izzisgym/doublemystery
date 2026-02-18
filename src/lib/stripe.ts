import Stripe from "stripe";
import { getStripeEnv } from "@/lib/env";

const env = getStripeEnv();
export const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export const PRICES = {
  ENTRY: 1300, // $13.00 in cents
  REROLL: 200, // $2.00 in cents
} as const;
