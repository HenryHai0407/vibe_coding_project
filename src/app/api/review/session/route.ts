import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createReviewSessionSchema } from "@/server/schemas/review.schema";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createReviewSessionSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid review session payload." }, { status: 400 });
  }

  const now = new Date();
  const cards = await db.reviewCard.findMany({
    where: {
      suspended: false,
      nextReviewAt: { lte: now },
      learningItem: {
        userId: session.user.id,
        archivedAt: null
      }
    },
    orderBy: [{ nextReviewAt: "asc" }, { createdAt: "asc" }],
    take: parsed.data.limit,
    include: {
      learningItem: {
        select: {
          id: true,
          type: true,
          finnishText: true,
          baseTranslation: true
        }
      }
    }
  });

  const createdSession = await db.reviewSession.create({
    data: {
      userId: session.user.id,
      mode: "flashcard"
    },
    select: {
      id: true,
      mode: true,
      startedAt: true
    }
  });

  return NextResponse.json({
    session: createdSession,
    cards,
    totalCards: cards.length
  });
}
