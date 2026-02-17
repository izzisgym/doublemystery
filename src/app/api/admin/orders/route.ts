import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered"] as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || "1");
    const pageSize = Math.min(Number(searchParams.get("pageSize") || "25"), 100);
    const skip = (Math.max(page, 1) - 1) * pageSize;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        include: {
          session: {
            include: {
              selectedBox: { include: { universe: true } },
              selectedItem: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.order.count(),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page: Math.max(page, 1),
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, status } = body as { orderId: string; status: string };
    if (!orderId || !ORDER_STATUSES.includes(status as never)) {
      return NextResponse.json(
        { error: "Invalid order update request" },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
