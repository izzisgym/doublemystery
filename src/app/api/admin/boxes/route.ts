import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, img, universeId } = body as {
      name: string;
      img: string;
      universeId: string;
    };

    const box = await prisma.box.create({
      data: { name, img, universeId },
      include: { items: true },
    });

    return NextResponse.json({ box });
  } catch (error) {
    console.error("Error creating box:", error);
    return NextResponse.json(
      { error: "Failed to create box" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, img } = body as {
      id: string;
      name: string;
      img: string;
    };

    const box = await prisma.box.update({
      where: { id },
      data: { name, img },
      include: { items: true },
    });

    return NextResponse.json({ box });
  } catch (error) {
    console.error("Error updating box:", error);
    return NextResponse.json(
      { error: "Failed to update box" },
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

    await prisma.item.deleteMany({ where: { boxId: id } });
    await prisma.box.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting box:", error);
    return NextResponse.json(
      { error: "Failed to delete box" },
      { status: 500 }
    );
  }
}
