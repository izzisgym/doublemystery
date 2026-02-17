import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPaymentIntent } from "@/lib/payments";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentIntentId } = body as { paymentIntentId: string };
    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "paymentIntentId is required" },
        { status: 400 }
      );
    }

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
        paymentIntentIds: paymentIntentId || "",
      },
    });

    return NextResponse.json({ sessionId: session.id, session });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}
