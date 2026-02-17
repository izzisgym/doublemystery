import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalOrders,
      pendingOrders,
      totalSessions,
      totalUniverses,
      totalBoxes,
      totalItems,
      orders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "pending" } }),
      prisma.blindboxSession.count({ where: { status: "completed" } }),
      prisma.universe.count(),
      prisma.box.count(),
      prisma.item.count(),
      prisma.order.findMany({ select: { totalAmount: true } }),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    return NextResponse.json({
      totalOrders,
      pendingOrders,
      totalSessions,
      totalRevenue,
      totalUniverses,
      totalBoxes,
      totalItems,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
