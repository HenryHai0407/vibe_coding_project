import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createExampleSchema } from "@/server/schemas/example.schema";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const item = await db.learningItem.findFirst({
    where: { id: params.id, userId: session.user.id },
    select: { id: true }
  });

  if (!item) {
    return NextResponse.json({ message: "Item not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createExampleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid example payload." }, { status: 400 });
  }

  const maxPosition = await db.exampleSentence.aggregate({
    where: { learningItemId: params.id },
    _max: { position: true }
  });

  const example = await db.exampleSentence.create({
    data: {
      learningItemId: params.id,
      finnishSentence: parsed.data.finnishSentence.trim(),
      englishTranslation: parsed.data.englishTranslation?.trim() || null,
      note: parsed.data.note?.trim() || null,
      position: (maxPosition._max.position ?? -1) + 1
    }
  });

  return NextResponse.json({ example }, { status: 201 });
}
