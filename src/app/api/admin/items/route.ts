import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logError } from "@/lib/logger";
import { applyRateLimit } from "@/lib/rate-limit";
import { parseJson, ValidationError } from "@/lib/validate";
import { prisma } from "@/lib/prisma";

const imageUrlSchema = z
  .string()
  .trim()
  .max(500)
  .refine(
    (value) =>
      value.length === 0 ||
      value.startsWith("/") ||
      /^https?:\/\//i.test(value),
    "imageUrl must be a relative path or http(s) URL"
  );

const createItemSchema = z.object({
  name: z.string().trim().min(1).max(120),
  rarity: z.string().trim().min(1).max(32).optional(),
  boxId: z.string().min(1),
  imageUrl: imageUrlSchema.optional(),
});

const updateItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(120),
  rarity: z.string().trim().min(1).max(32).optional(),
  imageUrl: imageUrlSchema.optional(),
});

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  try {
    const limit = applyRateLimit(request, {
      keyPrefix: "admin-items-write",
      windowMs: 60_000,
      maxRequests: 90,
    });
    if (limit) return limit;

    const { name, rarity, boxId, imageUrl } = await parseJson(
      request,
      createItemSchema
    );

    const item = await prisma.item.create({
      data: {
        name,
        rarity: rarity || "standard",
        boxId,
        imageUrl: imageUrl?.trim() || null,
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    logError("Error creating item", error, { requestId });
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  try {
    const limit = applyRateLimit(request, {
      keyPrefix: "admin-items-write",
      windowMs: 60_000,
      maxRequests: 90,
    });
    if (limit) return limit;

    const { id, name, rarity, imageUrl } = await parseJson(
      request,
      updateItemSchema
    );

    const item = await prisma.item.update({
      where: { id },
      data: {
        name,
        rarity: rarity || "standard",
        imageUrl: imageUrl?.trim() || null,
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    logError("Error updating item", error, { requestId });
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  try {
    const limit = applyRateLimit(request, {
      keyPrefix: "admin-items-write",
      windowMs: 60_000,
      maxRequests: 90,
    });
    if (limit) return limit;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    await prisma.item.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Error deleting item", error, { requestId });
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
