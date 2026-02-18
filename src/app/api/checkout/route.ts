import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logError } from "@/lib/logger";
import { applyRateLimit } from "@/lib/rate-limit";
import { parseJson, ValidationError } from "@/lib/validate";
import { prisma } from "@/lib/prisma";
import { splitPaymentIds } from "@/lib/payments";
import { stripe, PRICES } from "@/lib/stripe";

const checkoutSchema = z.object({
  sessionId: z.string().min(1),
  customerName: z.string().trim().min(2).max(120),
  streetAddress: z.string().trim().min(4).max(220),
  city: z.string().trim().min(2).max(120),
  state: z.string().trim().min(2).max(80),
  zipCode: z.string().trim().min(3).max(20),
});

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  try {
    const limit = applyRateLimit(request, {
      keyPrefix: "checkout",
      windowMs: 60_000,
      maxRequests: 10,
    });
    if (limit) return limit;

    const { sessionId, customerName, streetAddress, city, state, zipCode } =
      await parseJson(request, checkoutSchema);

    const session = await prisma.blindboxSession.findUnique({
      where: { id: sessionId },
      include: {
        selectedBox: { include: { universe: true } },
        selectedItem: true,
      },
    });

    if (!session || session.status !== "active" || !session.selectedItemId) {
      return NextResponse.json(
        { error: "Invalid session or no item selected" },
        { status: 400 }
      );
    }

    const paymentIntentIds = splitPaymentIds(session.paymentIntentIds);
    if (paymentIntentIds.length === 0) {
      return NextResponse.json(
        { error: "No payment records found for session" },
        { status: 400 }
      );
    }

    // Verify all recorded payment intents are successful and sum correctly.
    const intents = await Promise.all(
      paymentIntentIds.map((id) => stripe.paymentIntents.retrieve(id))
    );
    const invalidIntent = intents.find((pi) => pi.status !== "succeeded");
    if (invalidIntent) {
      return NextResponse.json(
        { error: "Session has incomplete payments" },
        { status: 400 }
      );
    }

    const paidCents = intents.reduce((sum, pi) => sum + pi.amount_received, 0);
    const expectedCents = PRICES.ENTRY + session.rerollCount * PRICES.REROLL;
    if (paidCents !== expectedCents) {
      return NextResponse.json(
        { error: "Session payments do not match expected total" },
        { status: 400 }
      );
    }

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          sessionId,
          customerName,
          streetAddress,
          city,
          state,
          zipCode,
          totalAmount: expectedCents / 100,
          stripePaymentId: paymentIntentIds[0] || null,
          status: "pending",
        },
      });

      await tx.blindboxSession.update({
        where: { id: sessionId },
        data: {
          status: "completed",
          currentStep: "checkout",
        },
      });

      return createdOrder;
    });

    return NextResponse.json({
      order,
      session: {
        ...session,
        status: "completed",
        currentStep: "checkout",
      },
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    logError("Error processing checkout", error, { requestId });
    return NextResponse.json(
      { error: "Failed to process checkout" },
      { status: 500 }
    );
  }
}
