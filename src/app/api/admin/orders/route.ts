import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logError } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { applyRateLimit } from "@/lib/rate-limit";
import { parseJson, ValidationError } from "@/lib/validate";

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered"] as const;
const patchOrderSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(ORDER_STATUSES),
});

export async function GET(request: NextRequest) {
  try {
    const limit = applyRateLimit(request, {
      keyPrefix: "admin-orders-read",
      windowMs: 60_000,
      maxRequests: 120,
    });
    if (limit) return limit;

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
    logError("Error fetching orders", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  try {
    const limit = applyRateLimit(request, {
      keyPrefix: "admin-orders-write",
      windowMs: 60_000,
      maxRequests: 60,
    });
    if (limit) return limit;
    const { orderId, status } = await parseJson(request, patchOrderSchema);

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    return NextResponse.json({ order });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    logError("Error updating order", error, { requestId });
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
