import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logError } from "@/lib/logger";
import { secureRandomIndex } from "@/lib/random";
import { applyRateLimit } from "@/lib/rate-limit";
import { parseJson, ValidationError } from "@/lib/validate";
import { prisma } from "@/lib/prisma";
import { splitPaymentIds, verifyPaymentIntent } from "@/lib/payments";

const rerollSchema = z.object({
  sessionId: z.string().min(1),
  type: z.enum(["box", "item"]),
  paymentIntentId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  try {
    const limit = applyRateLimit(request, {
      keyPrefix: "reroll",
      windowMs: 60_000,
      maxRequests: 20,
    });
    if (limit) return limit;

    const { sessionId, type, paymentIntentId } = await parseJson(
      request,
      rerollSchema
    );

    const session = await prisma.blindboxSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.status !== "active") {
      return NextResponse.json(
        { error: "Invalid or inactive session" },
        { status: 400 }
      );
    }

    await verifyPaymentIntent(paymentIntentId, "reroll", sessionId);

    const ids = splitPaymentIds(session.paymentIntentIds);
    if (ids.includes(paymentIntentId)) {
      return NextResponse.json(
        { error: "Payment intent already used for this session" },
        { status: 409 }
      );
    }

    const existingIds = [...ids, paymentIntentId];

    if (type === "box") {
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

      const randomIndex = secureRandomIndex(universe.boxes.length);
      const newBox = universe.boxes[randomIndex];

      await prisma.$transaction([
        prisma.blindboxSession.update({
          where: { id: sessionId },
          data: {
            rerollCount: session.rerollCount + 1,
            totalSpent: session.totalSpent + 2.0,
            paymentIntentIds: existingIds.join(","),
            selectedBoxId: newBox.id,
            selectedItemId: null,
            currentStep: "reveal_box",
          },
        }),
      ]);

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
      if (!session.selectedBoxId) {
        return NextResponse.json(
          { error: "No selected box found for this session" },
          { status: 400 }
        );
      }

      const items = await prisma.item.findMany({
        where: { boxId: session.selectedBoxId },
      });

      const box = await prisma.box.findUnique({
        where: { id: session.selectedBoxId },
      });

      if (items.length === 0) {
        return NextResponse.json(
          { error: "No items found in this box" },
          { status: 404 }
        );
      }

      const randomIndex = secureRandomIndex(items.length);
      const newItem = items[randomIndex];

      await prisma.$transaction([
        prisma.blindboxSession.update({
          where: { id: sessionId },
          data: {
            rerollCount: session.rerollCount + 1,
            totalSpent: session.totalSpent + 2.0,
            paymentIntentIds: existingIds.join(","),
            selectedItemId: newItem.id,
            currentStep: "reveal_item",
          },
        }),
      ]);

      return NextResponse.json({
        item: newItem,
        box,
      });
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    logError("Error processing reroll", error, { requestId });
    return NextResponse.json(
      { error: "Failed to process reroll" },
      { status: 500 }
    );
  }
}
