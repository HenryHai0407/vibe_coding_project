import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const existing = await db.learningItem.findFirst({
    where: {
      id: params.id,
      userId: session.user.id
    },
    select: { id: true }
  });

  if (!existing) {
    return NextResponse.json({ message: "Item not found." }, { status: 404 });
  }

  const updated = await db.learningItem.update({
    where: { id: params.id },
    data: { archivedAt: new Date() },
    select: { archivedAt: true }
  });

  return NextResponse.json({ success: true, archivedAt: updated.archivedAt });
}
