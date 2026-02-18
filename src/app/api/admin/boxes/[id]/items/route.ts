import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { applyRateLimit } from "@/lib/rate-limit";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const limit = applyRateLimit(request, {
      keyPrefix: "admin-box-items-read",
      windowMs: 60_000,
      maxRequests: 180,
    });
    if (limit) return limit;

    const { id } = await params;
    const items = await prisma.item.findMany({
      where: { boxId: id },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ items });
  } catch (error) {
    logError("Error fetching items for box", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}
