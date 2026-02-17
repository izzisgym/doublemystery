import { stripe, PRICES } from "@/lib/stripe";

type PaymentType = "entry" | "reroll";

export async function verifyPaymentIntent(
  paymentIntentId: string,
  expectedType: PaymentType,
  expectedSessionId?: string
) {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== "succeeded") {
    throw new Error("Payment is not successful");
  }

  if (paymentIntent.currency !== "usd") {
    throw new Error("Invalid payment currency");
  }

  const expectedAmount =
    expectedType === "entry" ? PRICES.ENTRY : PRICES.REROLL;
  if (paymentIntent.amount_received !== expectedAmount) {
    throw new Error("Invalid payment amount");
  }

  if (paymentIntent.metadata?.type !== expectedType) {
    throw new Error("Invalid payment type");
  }

  if (expectedType === "reroll") {
    if (!expectedSessionId) throw new Error("Missing session for reroll");
    if (paymentIntent.metadata?.sessionId !== expectedSessionId) {
      throw new Error("Payment session mismatch");
    }
  }

  return paymentIntent;
}

export function splitPaymentIds(rawIds: string) {
  return rawIds
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}
