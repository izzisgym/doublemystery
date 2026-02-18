import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logError } from "@/lib/logger";
import { applyRateLimit } from "@/lib/rate-limit";
import { parseJson, ValidationError } from "@/lib/validate";
import { stripe, PRICES } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

const paymentIntentSchema = z.object({
  type: z.enum(["entry", "reroll"]),
  sessionId: z.string().min(1).optional(),
});

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  try {
    const limit = applyRateLimit(request, {
      keyPrefix: "payment-intent",
      windowMs: 60_000,
      maxRequests: 20,
    });
    if (limit) return limit;

    const { type, sessionId } = await parseJson(request, paymentIntentSchema);
    if (type === "reroll" && !sessionId) {
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
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    logError("Error creating payment intent", error, { requestId });
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
