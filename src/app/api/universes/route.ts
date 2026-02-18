import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";

export const revalidate = 300;

export async function GET() {
  try {
    const universes = await prisma.universe.findMany({
      include: {
        boxes: {
          include: {
            _count: { select: { items: true } },
          },
        },
      },
    });

    return NextResponse.json(
      { universes },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    logError("Error fetching universes", error);
    return NextResponse.json(
      { error: "Failed to fetch universes" },
      { status: 500 }
    );
  }
}
