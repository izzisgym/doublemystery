import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { applyRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function getExtension(file: File) {
  switch (file.type) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    default:
      return "";
  }
}

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  try {
    const limit = applyRateLimit(request, {
      keyPrefix: "admin-item-image-upload",
      windowMs: 60_000,
      maxRequests: 40,
    });
    if (limit) return limit;

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Use JPG, PNG, WEBP, or GIF." },
        { status: 400 }
      );
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "File too large. Max size is 5MB." },
        { status: 400 }
      );
    }

    const extension = getExtension(file);
    if (!extension) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "items");
    await mkdir(uploadDir, { recursive: true });

    const filename = `${Date.now()}-${crypto.randomUUID()}${extension}`;
    const destination = path.join(uploadDir, filename);
    const bytes = await file.arrayBuffer();
    await writeFile(destination, Buffer.from(bytes));

    const imageUrl = `/uploads/items/${filename}`;
    return NextResponse.json({ imageUrl });
  } catch (error) {
    logError("Error uploading item image", error, { requestId });
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
