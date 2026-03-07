import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createItemSchema } from "@/server/schemas/item.schema";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const items = await db.learningItem.findMany({
    where: {
      userId: session.user.id,
      archivedAt: null
    },
    orderBy: { createdAt: "desc" },
    include: {
      examples: {
        orderBy: { position: "asc" }
      }
    }
  });

  return NextResponse.json({
    items,
    pagination: {
      page: 1,
      pageSize: items.length,
      total: items.length
    }
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createItemSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid item payload." }, { status: 400 });
  }

  const item = await db.learningItem.create({
    data: {
      userId: session.user.id,
      type: parsed.data.type,
      finnishText: parsed.data.finnishText.trim(),
      baseTranslation: parsed.data.baseTranslation?.trim() || null,
      explanation: parsed.data.explanation?.trim() || null,
      usageNote: parsed.data.usageNote?.trim() || null,
      sourceContext: parsed.data.sourceContext?.trim() || null,
      difficulty: parsed.data.difficulty,
      examples: {
        create: parsed.data.examples.map((example, index) => ({
          finnishSentence: example.finnishSentence.trim(),
          englishTranslation: example.englishTranslation?.trim() || null,
          note: example.note?.trim() || null,
          position: index
        }))
      }
    },
    select: {
      id: true,
      type: true,
      finnishText: true,
      createdAt: true
    }
  });

  return NextResponse.json({ item }, { status: 201 });
}
