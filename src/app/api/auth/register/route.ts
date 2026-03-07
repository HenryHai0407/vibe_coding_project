import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limit";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  displayName: z.string().min(1).max(80)
});

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid input." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const clientIp = getClientIp(request);
  const limiter = checkRateLimit({
    key: `register:${clientIp}`,
    windowMs: 60_000,
    maxRequests: 10
  });

  if (limiter.limited) {
    logger.warn("rate_limit.register", { clientIp, email });
    return NextResponse.json(
      { message: "Too many registration attempts. Please try again shortly." },
      {
        status: 429,
        headers: {
          "Retry-After": String(limiter.retryAfterSeconds)
        }
      }
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  try {
    await db.user.create({
      data: {
        email,
        passwordHash,
        displayName: parsed.data.displayName.trim()
      },
      select: {
        id: true,
        email: true,
        displayName: true
      }
    });

    logger.info("auth.register.success", { email });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    logger.warn("auth.register.failed", {
      email,
      reason: "create_failed",
      error: error instanceof Error ? error.message : "unknown"
    });

    return NextResponse.json(
      { message: "Unable to create account. Please verify your input and try again." },
      { status: 400 }
    );
  }
}
