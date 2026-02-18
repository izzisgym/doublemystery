import { NextResponse } from "next/server";
import { logError } from "@/lib/logger";
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
      revenueAggregate,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "pending" } }),
      prisma.blindboxSession.count({ where: { status: "completed" } }),
      prisma.universe.count(),
      prisma.box.count(),
      prisma.item.count(),
      prisma.order.aggregate({ _sum: { totalAmount: true } }),
    ]);

    const totalRevenue = revenueAggregate._sum.totalAmount ?? 0;

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
    logError("Error fetching stats", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
