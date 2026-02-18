import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logError } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { applyRateLimit } from "@/lib/rate-limit";
import { parseJson, ValidationError } from "@/lib/validate";

const universeSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(120),
  emoji: z.string().trim().min(1).max(12),
  color: z.string().trim().min(3).max(32),
  gradient: z.string().trim().min(6).max(200),
});

const updateUniverseSchema = universeSchema.extend({
  id: z.string().min(1),
});

export async function GET(request: NextRequest) {
  try {
    const includeTree = new URL(request.url).searchParams.get("includeTree") === "1";
    const universes = await prisma.universe.findMany({
      include: includeTree
        ? {
            boxes: {
              include: {
                items: true,
                _count: { select: { items: true } },
              },
            },
            _count: { select: { boxes: true } },
          }
        : {
            _count: { select: { boxes: true } },
          },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ universes });
  } catch (error) {
    logError("Error fetching universes", error);
    return NextResponse.json(
      { error: "Failed to fetch universes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  try {
    const limit = applyRateLimit(request, {
      keyPrefix: "admin-universes-write",
      windowMs: 60_000,
      maxRequests: 60,
    });
    if (limit) return limit;

    const { name, slug, emoji, color, gradient } = await parseJson(
      request,
      universeSchema
    );

    const universe = await prisma.universe.create({
      data: { name, slug, emoji, color, gradient },
    });

    return NextResponse.json({ universe });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    logError("Error creating universe", error, { requestId });
    return NextResponse.json(
      { error: "Failed to create universe" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  try {
    const limit = applyRateLimit(request, {
      keyPrefix: "admin-universes-write",
      windowMs: 60_000,
      maxRequests: 60,
    });
    if (limit) return limit;

    const { id, name, slug, emoji, color, gradient } = await parseJson(
      request,
      updateUniverseSchema
    );

    const universe = await prisma.universe.update({
      where: { id },
      data: { name, slug, emoji, color, gradient },
    });

    return NextResponse.json({ universe });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    logError("Error updating universe", error, { requestId });
    return NextResponse.json(
      { error: "Failed to update universe" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  try {
    const limit = applyRateLimit(request, {
      keyPrefix: "admin-universes-write",
      windowMs: 60_000,
      maxRequests: 60,
    });
    if (limit) return limit;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      const boxes = await tx.box.findMany({ where: { universeId: id } });
      for (const box of boxes) {
        await tx.item.deleteMany({ where: { boxId: box.id } });
      }
      await tx.box.deleteMany({ where: { universeId: id } });
      await tx.universe.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Error deleting universe", error, { requestId });
    return NextResponse.json(
      { error: "Failed to delete universe" },
      { status: 500 }
    );
  }
}
