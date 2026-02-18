import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logError } from "@/lib/logger";
import { secureRandomIndex } from "@/lib/random";
import { parseJson, ValidationError } from "@/lib/validate";
import { prisma } from "@/lib/prisma";

const revealItemSchema = z.object({
  sessionId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  try {
    const { sessionId } = await parseJson(request, revealItemSchema);

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

    const randomIndex = secureRandomIndex(items.length);
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
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    logError("Error revealing item", error, { requestId });
    return NextResponse.json(
      { error: "Failed to reveal item" },
      { status: 500 }
    );
  }
}
