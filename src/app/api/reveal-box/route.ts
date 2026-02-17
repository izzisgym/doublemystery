import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, universeSlug } = body as {
      sessionId: string;
      universeSlug: string;
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

    const universe = await prisma.universe.findUnique({
      where: { slug: universeSlug },
      include: { boxes: true },
    });

    if (!universe || universe.boxes.length === 0) {
      return NextResponse.json(
        { error: "Universe not found or has no boxes" },
        { status: 404 }
      );
    }

    // Server-side random pick
    const randomIndex = Math.floor(Math.random() * universe.boxes.length);
    const selectedBox = universe.boxes[randomIndex];

    await prisma.blindboxSession.update({
      where: { id: sessionId },
      data: {
        universeSlug,
        selectedBoxId: selectedBox.id,
        selectedItemId: null,
        currentStep: "reveal_box",
      },
    });

    return NextResponse.json({
      box: selectedBox,
      universe: {
        name: universe.name,
        emoji: universe.emoji,
        color: universe.color,
        gradient: universe.gradient,
        slug: universe.slug,
      },
    });
  } catch (error) {
    console.error("Error revealing box:", error);
    return NextResponse.json(
      { error: "Failed to reveal box" },
      { status: 500 }
    );
  }
}
