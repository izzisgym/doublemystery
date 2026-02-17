import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentIntentId } = body as { paymentIntentId: string };

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
