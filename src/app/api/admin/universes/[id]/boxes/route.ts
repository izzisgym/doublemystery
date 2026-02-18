import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { applyRateLimit } from "@/lib/rate-limit";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const limit = applyRateLimit(request, {
      keyPrefix: "admin-universe-boxes-read",
      windowMs: 60_000,
      maxRequests: 120,
    });
    if (limit) return limit;

    const { id } = await params;
    const boxes = await prisma.box.findMany({
      where: { universeId: id },
      include: {
        _count: { select: { items: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ boxes });
  } catch (error) {
    logError("Error fetching boxes for universe", error);
    return NextResponse.json(
      { error: "Failed to fetch boxes" },
      { status: 500 }
    );
  }
}
