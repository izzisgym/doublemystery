import { NextRequest, NextResponse } from "next/server";
import { stripe, PRICES } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, sessionId } = body as {
      type: "entry" | "reroll";
      sessionId?: string;
    };
    if (!type || (type === "reroll" && !sessionId)) {
      return NextResponse.json(
        { error: "Invalid payment request" },
        { status: 400 }
      );
    }

    if (type === "reroll") {
      const session = await prisma.blindboxSession.findUnique({
        where: { id: sessionId },
        select: { id: true, status: true },
      });
      if (!session || session.status !== "active") {
        return NextResponse.json(
          { error: "Session not found or inactive" },
          { status: 400 }
        );
      }
    }

    const amount = type === "entry" ? PRICES.ENTRY : PRICES.REROLL;
    const description =
      type === "entry"
        ? "Double Mystery - Entry"
        : "Double Mystery - Reroll";

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      description,
      metadata: {
        type,
        sessionId: sessionId || "",
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
