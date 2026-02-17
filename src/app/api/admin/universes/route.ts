import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const universes = await prisma.universe.findMany({
      include: {
        boxes: {
          include: {
            items: true,
            _count: { select: { items: true } },
          },
        },
        _count: { select: { boxes: true } },
      },
      orderBy: { name: "asc" },
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, emoji, color, gradient } = body as {
      name: string;
      slug: string;
      emoji: string;
      color: string;
      gradient: string;
    };

    const universe = await prisma.universe.create({
      data: { name, slug, emoji, color, gradient },
    });

    return NextResponse.json({ universe });
  } catch (error) {
    console.error("Error creating universe:", error);
    return NextResponse.json(
      { error: "Failed to create universe" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, slug, emoji, color, gradient } = body as {
      id: string;
      name: string;
      slug: string;
      emoji: string;
      color: string;
      gradient: string;
    };

    const universe = await prisma.universe.update({
      where: { id },
      data: { name, slug, emoji, color, gradient },
    });

    return NextResponse.json({ universe });
  } catch (error) {
    console.error("Error updating universe:", error);
    return NextResponse.json(
      { error: "Failed to update universe" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    // Delete items, boxes, then universe
    const boxes = await prisma.box.findMany({ where: { universeId: id } });
    for (const box of boxes) {
      await prisma.item.deleteMany({ where: { boxId: box.id } });
    }
    await prisma.box.deleteMany({ where: { universeId: id } });
    await prisma.universe.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting universe:", error);
    return NextResponse.json(
      { error: "Failed to delete universe" },
      { status: 500 }
    );
  }
}
