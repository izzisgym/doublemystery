import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const { sessionId } = paymentIntent.metadata;

      if (sessionId) {
        const session = await prisma.blindboxSession.findUnique({
          where: { id: sessionId },
        });

        if (session) {
          const existingIds = session.paymentIntentIds
            ? session.paymentIntentIds.split(",")
            : [];
          if (!existingIds.includes(paymentIntent.id)) {
            existingIds.push(paymentIntent.id);
          }

          await prisma.blindboxSession.update({
            where: { id: sessionId },
            data: {
              paymentIntentIds: existingIds.join(","),
            },
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    );
  }
}
