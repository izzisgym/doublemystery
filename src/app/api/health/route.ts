import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { logError } from "@/lib/logger";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    let stripeReachable = true;
    try {
      await stripe.balance.retrieve();
    } catch {
      stripeReachable = false;
    }

    return NextResponse.json({
      ok: true,
      database: "up",
      stripeReachable,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logError("Health check failed", error);
    return NextResponse.json(
      {
        ok: false,
        database: "down",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
