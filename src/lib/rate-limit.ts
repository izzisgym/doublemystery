import { NextRequest, NextResponse } from "next/server";

type Bucket = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  keyPrefix: string;
  windowMs: number;
  maxRequests: number;
};

const buckets = new Map<string, Bucket>();

function getIpAddress(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") || "unknown";
}

export function applyRateLimit(
  request: NextRequest,
  { keyPrefix, windowMs, maxRequests }: RateLimitOptions
) {
  const now = Date.now();
  const bucketKey = `${keyPrefix}:${getIpAddress(request)}`;
  const existing = buckets.get(bucketKey);

  if (!existing || now > existing.resetAt) {
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return null;
  }

  existing.count += 1;
  if (existing.count <= maxRequests) {
    buckets.set(bucketKey, existing);
    return null;
  }

  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((existing.resetAt - now) / 1000)
  );

  return NextResponse.json(
    { error: "Too many requests" },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
      },
    }
  );
}
