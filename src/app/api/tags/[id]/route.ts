import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateTagSchema } from "@/server/schemas/tag.schema";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const existing = await db.tag.findFirst({
    where: { id: params.id, userId: session.user.id },
    select: { id: true }
  });
  if (!existing) {
    return NextResponse.json({ message: "Tag not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateTagSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid tag update payload." }, { status: 400 });
  }

  try {
    const tag = await db.tag.update({
      where: { id: params.id },
      data: {
        ...(parsed.data.name !== undefined ? { name: parsed.data.name.trim() } : {}),
        ...(parsed.data.color !== undefined ? { color: parsed.data.color?.trim() || null } : {})
      }
    });

    return NextResponse.json({ tag });
  } catch {
    return NextResponse.json({ message: "Unable to update tag." }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const existing = await db.tag.findFirst({
    where: { id: params.id, userId: session.user.id },
    select: { id: true }
  });

  if (!existing) {
    return NextResponse.json({ message: "Tag not found." }, { status: 404 });
  }

  await db.tag.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
