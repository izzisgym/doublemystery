import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logError } from "@/lib/logger";
import { applyRateLimit } from "@/lib/rate-limit";
import { parseJson, ValidationError } from "@/lib/validate";
import { prisma } from "@/lib/prisma";
import { verifyPaymentIntent } from "@/lib/payments";

const createSessionSchema = z.object({
  paymentIntentId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  try {
    const limit = applyRateLimit(request, {
      keyPrefix: "session",
      windowMs: 60_000,
      maxRequests: 10,
    });
    if (limit) return limit;

    const { paymentIntentId } = await parseJson(request, createSessionSchema);

    // Ensure this payment intent is real, succeeded, and correct amount/type.
    await verifyPaymentIntent(paymentIntentId, "entry");

    // Prevent reusing the same entry payment for multiple sessions.
    const reused = await prisma.blindboxSession.findFirst({
      where: { paymentIntentIds: { contains: paymentIntentId } },
      select: { id: true },
    });
    if (reused) {
      return NextResponse.json(
        { error: "Payment intent already used" },
        { status: 409 }
      );
    }

    const session = await prisma.blindboxSession.create({
      data: {
        status: "active",
        totalSpent: 13.0,
        currentStep: "genre",
        paymentIntentIds: paymentIntentId,
      },
    });

    return NextResponse.json({ sessionId: session.id, session });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    logError("Error creating session", error, { requestId });
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID required" },
        { status: 400 }
      );
    }

    const session = await prisma.blindboxSession.findUnique({
      where: { id: sessionId },
      include: {
        selectedBox: { include: { universe: true } },
        selectedItem: true,
        order: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ session });
  } catch (error) {
    logError("Error fetching session", error, { requestId });
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}
