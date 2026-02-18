import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logError } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { applyRateLimit } from "@/lib/rate-limit";
import { parseJson, ValidationError } from "@/lib/validate";

const createBoxSchema = z.object({
  name: z.string().trim().min(1).max(120),
  img: z.string().trim().min(1).max(32),
  universeId: z.string().min(1),
});

const updateBoxSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(120),
  img: z.string().trim().min(1).max(32),
});

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  try {
    const limit = applyRateLimit(request, {
      keyPrefix: "admin-boxes-write",
      windowMs: 60_000,
      maxRequests: 60,
    });
    if (limit) return limit;

    const { name, img, universeId } = await parseJson(request, createBoxSchema);

    const box = await prisma.box.create({
      data: { name, img, universeId },
      include: { items: true },
    });

    return NextResponse.json({ box });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    logError("Error creating box", error, { requestId });
    return NextResponse.json(
      { error: "Failed to create box" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  try {
    const limit = applyRateLimit(request, {
      keyPrefix: "admin-boxes-write",
      windowMs: 60_000,
      maxRequests: 60,
    });
    if (limit) return limit;

    const { id, name, img } = await parseJson(request, updateBoxSchema);

    const box = await prisma.box.update({
      where: { id },
      data: { name, img },
      include: { items: true },
    });

    return NextResponse.json({ box });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    logError("Error updating box", error, { requestId });
    return NextResponse.json(
      { error: "Failed to update box" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  try {
    const limit = applyRateLimit(request, {
      keyPrefix: "admin-boxes-write",
      windowMs: 60_000,
      maxRequests: 60,
    });
    if (limit) return limit;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    await prisma.item.deleteMany({ where: { boxId: id } });
    await prisma.box.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Error deleting box", error, { requestId });
    return NextResponse.json(
      { error: "Failed to delete box" },
      { status: 500 }
    );
  }
}
