import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateItemSchema } from "@/server/schemas/item.schema";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const item = await db.learningItem.findFirst({
    where: {
      id: params.id,
      userId: session.user.id
    },
    include: {
      examples: {
        orderBy: { position: "asc" }
      },
      itemTags: {
        include: { tag: true }
      }
    }
  });

  if (!item) {
    return NextResponse.json({ message: "Item not found." }, { status: 404 });
  }

  return NextResponse.json({
    item: {
      ...item,
      tags: item.itemTags.map((entry) => ({ id: entry.tag.id, name: entry.tag.name, color: entry.tag.color }))
    }
  });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
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

  const body = await request.json().catch(() => null);
  const parsed = updateItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid item update payload." }, { status: 400 });
  }

  const updated = await db.learningItem.update({
    where: { id: params.id },
    data: {
      ...(parsed.data.type !== undefined ? { type: parsed.data.type } : {}),
      ...(parsed.data.finnishText !== undefined ? { finnishText: parsed.data.finnishText.trim() } : {}),
      ...(parsed.data.baseTranslation !== undefined ? { baseTranslation: parsed.data.baseTranslation.trim() || null } : {}),
      ...(parsed.data.explanation !== undefined ? { explanation: parsed.data.explanation.trim() || null } : {}),
      ...(parsed.data.usageNote !== undefined ? { usageNote: parsed.data.usageNote.trim() || null } : {}),
      ...(parsed.data.sourceContext !== undefined ? { sourceContext: parsed.data.sourceContext.trim() || null } : {}),
      ...(parsed.data.difficulty !== undefined ? { difficulty: parsed.data.difficulty } : {})
    },
    select: {
      id: true,
      updatedAt: true
    }
  });

  if (parsed.data.examples) {
    await db.exampleSentence.deleteMany({ where: { learningItemId: params.id } });
    if (parsed.data.examples.length > 0) {
      await db.exampleSentence.createMany({
        data: parsed.data.examples.map((example, index) => ({
          learningItemId: params.id,
          finnishSentence: example.finnishSentence.trim(),
          englishTranslation: example.englishTranslation?.trim() || null,
          note: example.note?.trim() || null,
          position: index
        }))
      });
    }
  }

  if (parsed.data.tagIds) {
    const ownedTags = await db.tag.findMany({
      where: {
        userId: session.user.id,
        id: { in: parsed.data.tagIds }
      },
      select: { id: true }
    });

    await db.learningItemTag.deleteMany({ where: { learningItemId: params.id } });
    if (ownedTags.length > 0) {
      await db.learningItemTag.createMany({
        data: ownedTags.map((tag) => ({ learningItemId: params.id, tagId: tag.id })),
        skipDuplicates: true
      });
    }
  }

  return NextResponse.json({ item: updated });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
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

  await db.learningItem.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
