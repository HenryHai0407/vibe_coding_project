import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateExampleSchema } from "@/server/schemas/example.schema";

async function getOwnedExample(exampleId: string, userId: string) {
  return db.exampleSentence.findFirst({
    where: {
      id: exampleId,
      learningItem: {
        userId
      }
    },
    select: { id: true }
  });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const existing = await getOwnedExample(params.id, session.user.id);
  if (!existing) {
    return NextResponse.json({ message: "Example not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateExampleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid example update payload." }, { status: 400 });
  }

  const example = await db.exampleSentence.update({
    where: { id: params.id },
    data: {
      ...(parsed.data.finnishSentence !== undefined ? { finnishSentence: parsed.data.finnishSentence.trim() } : {}),
      ...(parsed.data.englishTranslation !== undefined ? { englishTranslation: parsed.data.englishTranslation.trim() || null } : {}),
      ...(parsed.data.note !== undefined ? { note: parsed.data.note.trim() || null } : {})
    }
  });

  return NextResponse.json({ example });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const existing = await getOwnedExample(params.id, session.user.id);
  if (!existing) {
    return NextResponse.json({ message: "Example not found." }, { status: 404 });
  }

  await db.exampleSentence.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
