import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { getStripeWebhookEnv } from "@/lib/env";
import { logError, logInfo } from "@/lib/logger";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  try {
    const webhookEnv = getStripeWebhookEnv();
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookEnv.STRIPE_WEBHOOK_SECRET
    );

    const alreadyProcessed = await prisma.stripeWebhookEvent.findUnique({
      where: { stripeEventId: event.id },
      select: { id: true },
    });
    if (alreadyProcessed) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    try {
      await prisma.$transaction(async (tx) => {
        await tx.stripeWebhookEvent.create({
          data: {
            stripeEventId: event.id,
            type: event.type,
          },
        });

        if (event.type !== "payment_intent.succeeded") return;

        const paymentIntent = event.data.object;
        const { sessionId } = paymentIntent.metadata;
        if (!sessionId) return;

        const session = await tx.blindboxSession.findUnique({
          where: { id: sessionId },
          select: { id: true, paymentIntentIds: true },
        });

        if (!session) return;

        const ids = session.paymentIntentIds
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean);
        if (ids.includes(paymentIntent.id)) return;

        ids.push(paymentIntent.id);
        await tx.blindboxSession.update({
          where: { id: sessionId },
          data: {
            paymentIntentIds: ids.join(","),
          },
        });
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return NextResponse.json({ received: true, duplicate: true });
      }
      throw error;
    }

    logInfo("Stripe webhook processed", {
      requestId,
      eventId: event.id,
      type: event.type,
    });
    return NextResponse.json({ received: true });
  } catch (error) {
    logError("Webhook handler failed", error, { requestId });
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    );
  }
}
