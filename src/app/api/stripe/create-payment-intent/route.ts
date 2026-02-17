import { NextRequest, NextResponse } from "next/server";
import { stripe, PRICES } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, sessionId } = body as {
      type: "entry" | "reroll";
      sessionId?: string;
    };

    const amount = type === "entry" ? PRICES.ENTRY : PRICES.REROLL;
    const description =
      type === "entry"
        ? "Blindbox Entry - Double Mystery"
        : "Blindbox Reroll";

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
