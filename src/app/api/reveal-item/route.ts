import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body as { sessionId: string };

    const session = await prisma.blindboxSession.findUnique({
      where: { id: sessionId },
      include: { selectedBox: true },
    });

    if (!session || session.status !== "active" || !session.selectedBoxId) {
      return NextResponse.json(
        { error: "Invalid session or no box selected" },
        { status: 400 }
      );
    }

    const items = await prisma.item.findMany({
      where: { boxId: session.selectedBoxId },
    });

    if (items.length === 0) {
      return NextResponse.json(
        { error: "No items found in this box" },
        { status: 404 }
      );
    }

    // Server-side random pick
    const randomIndex = Math.floor(Math.random() * items.length);
    const selectedItem = items[randomIndex];

    await prisma.blindboxSession.update({
      where: { id: sessionId },
      data: {
        selectedItemId: selectedItem.id,
        currentStep: "reveal_item",
      },
    });

    return NextResponse.json({
      item: selectedItem,
      box: session.selectedBox,
    });
  } catch (error) {
    console.error("Error revealing item:", error);
    return NextResponse.json(
      { error: "Failed to reveal item" },
      { status: 500 }
    );
  }
}
