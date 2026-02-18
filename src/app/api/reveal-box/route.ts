import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logError } from "@/lib/logger";
import { secureRandomIndex } from "@/lib/random";
import { parseJson, ValidationError } from "@/lib/validate";
import { prisma } from "@/lib/prisma";

const revealBoxSchema = z.object({
  sessionId: z.string().min(1),
  universeSlug: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  try {
    const { sessionId, universeSlug } = await parseJson(request, revealBoxSchema);

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

    const randomIndex = secureRandomIndex(universe.boxes.length);
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
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    logError("Error revealing box", error, { requestId });
    return NextResponse.json(
      { error: "Failed to reveal box" },
      { status: 500 }
    );
  }
}
