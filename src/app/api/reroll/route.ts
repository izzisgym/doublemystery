import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, type, paymentIntentId } = body as {
      sessionId: string;
      type: "box" | "item";
      paymentIntentId: string;
    };

    const session = await prisma.blindboxSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.status !== "active") {
      return NextResponse.json(
        { error: "Invalid or inactive session" },
        { status: 400 }
      );
    }

    // Record the reroll payment
    const existingIds = session.paymentIntentIds
      ? session.paymentIntentIds.split(",")
      : [];
    existingIds.push(paymentIntentId);

    await prisma.blindboxSession.update({
      where: { id: sessionId },
      data: {
        rerollCount: session.rerollCount + 1,
        totalSpent: session.totalSpent + 2.0,
        paymentIntentIds: existingIds.join(","),
      },
    });

    if (type === "box") {
      // Re-pick a random box from the same universe
      const universe = await prisma.universe.findUnique({
        where: { slug: session.universeSlug! },
        include: { boxes: true },
      });

      if (!universe) {
        return NextResponse.json(
          { error: "Universe not found" },
          { status: 404 }
        );
      }

      const randomIndex = Math.floor(Math.random() * universe.boxes.length);
      const newBox = universe.boxes[randomIndex];

      await prisma.blindboxSession.update({
        where: { id: sessionId },
        data: {
          selectedBoxId: newBox.id,
          selectedItemId: null,
          currentStep: "reveal_box",
        },
      });

      return NextResponse.json({
        box: newBox,
        universe: {
          name: universe.name,
          emoji: universe.emoji,
          color: universe.color,
          gradient: universe.gradient,
          slug: universe.slug,
        },
      });
    } else {
      // Re-pick a random item from the same box
      const items = await prisma.item.findMany({
        where: { boxId: session.selectedBoxId! },
      });

      const box = await prisma.box.findUnique({
        where: { id: session.selectedBoxId! },
      });

      const randomIndex = Math.floor(Math.random() * items.length);
      const newItem = items[randomIndex];

      await prisma.blindboxSession.update({
        where: { id: sessionId },
        data: {
          selectedItemId: newItem.id,
          currentStep: "reveal_item",
        },
      });

      return NextResponse.json({
        item: newItem,
        box,
      });
    }
  } catch (error) {
    console.error("Error processing reroll:", error);
    return NextResponse.json(
      { error: "Failed to process reroll" },
      { status: 500 }
    );
  }
}
