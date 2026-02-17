import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { splitPaymentIds } from "@/lib/payments";
import { stripe, PRICES } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, customerName, streetAddress, city, state, zipCode } =
      body as {
        sessionId: string;
        customerName: string;
        streetAddress: string;
        city: string;
        state: string;
        zipCode: string;
      };

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
    if (paidCents < expectedCents) {
      return NextResponse.json(
        { error: "Session payments do not match expected total" },
        { status: 400 }
      );
    }

    // Create the order
    const order = await prisma.order.create({
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

    // Mark session as completed
    await prisma.blindboxSession.update({
      where: { id: sessionId },
      data: {
        status: "completed",
        currentStep: "checkout",
      },
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
    console.error("Error processing checkout:", error);
    return NextResponse.json(
      { error: "Failed to process checkout" },
      { status: 500 }
    );
  }
}
