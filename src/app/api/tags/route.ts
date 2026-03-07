import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createTagSchema } from "@/server/schemas/tag.schema";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const tags = await db.tag.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" }
  });

  return NextResponse.json({ tags });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createTagSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid tag payload." }, { status: 400 });
  }

  try {
    const tag = await db.tag.create({
      data: {
        userId: session.user.id,
        name: parsed.data.name.trim(),
        color: parsed.data.color?.trim() || null
      }
    });

    return NextResponse.json({ tag }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Unable to create tag." }, { status: 400 });
  }
}
