import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    // Create the order
    const order = await prisma.order.create({
      data: {
        sessionId,
        customerName,
        streetAddress,
        city,
        state,
        zipCode,
        totalAmount: session.totalSpent,
        stripePaymentId: session.paymentIntentIds.split(",")[0] || null,
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
