import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    return NextResponse.json({ universes });
  } catch (error) {
    console.error("Error fetching universes:", error);
    return NextResponse.json(
      { error: "Failed to fetch universes" },
      { status: 500 }
    );
  }
}
