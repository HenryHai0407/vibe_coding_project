import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  displayName: z.string().min(1).max(80)
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid input." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  try {
    const user = await db.user.create({
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

    return NextResponse.json({ user }, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Unable to create account. Please verify your input and try again." },
      { status: 400 }
    );
  }
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "register endpoint scaffolded" }, { status: 501 });
}
