import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { submitReviewAttemptSchema } from "@/server/schemas/review.schema";
import { calculateNextInterval, calculateNextReviewAt } from "@/server/services/review.service";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = submitReviewAttemptSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid review attempt payload." }, { status: 400 });
  }

  const reviewSession = await db.reviewSession.findFirst({
    where: {
      id: parsed.data.reviewSessionId,
      userId: session.user.id,
      mode: "flashcard",
      completedAt: null
    },
    select: { id: true }
  });

  if (!reviewSession) {
    return NextResponse.json({ message: "Review session not found." }, { status: 404 });
  }

  const reviewCard = await db.reviewCard.findFirst({
    where: {
      id: parsed.data.reviewCardId,
      learningItem: {
        userId: session.user.id
      }
    },
    select: {
      id: true,
      intervalDays: true,
      repetitionCount: true
    }
  });

  if (!reviewCard) {
    return NextResponse.json({ message: "Review card not found." }, { status: 404 });
  }

  const now = new Date();
  const nextInterval = calculateNextInterval(reviewCard.intervalDays, parsed.data.result);
  const nextReviewAt = calculateNextReviewAt(now, nextInterval);

  const [, updatedCard] = await db.$transaction([
    db.reviewAttempt.create({
      data: {
        reviewSessionId: parsed.data.reviewSessionId,
        reviewCardId: parsed.data.reviewCardId,
        result: parsed.data.result,
        responseMs: parsed.data.responseMs,
        responseText: parsed.data.responseText?.trim() || null
      }
    }),
    db.reviewCard.update({
      where: { id: parsed.data.reviewCardId },
      data: {
        intervalDays: nextInterval,
        repetitionCount: reviewCard.repetitionCount + 1,
        lastReviewedAt: now,
        nextReviewAt
      },
      select: {
        id: true,
        intervalDays: true,
        repetitionCount: true,
        nextReviewAt: true,
        lastReviewedAt: true
      }
    })
  ]);

  const remainingDue = await db.reviewCard.count({
    where: {
      suspended: false,
      nextReviewAt: { lte: now },
      learningItem: {
        userId: session.user.id,
        archivedAt: null
      }
    }
  });

  if (remainingDue === 0) {
    await db.reviewSession.update({
      where: { id: parsed.data.reviewSessionId },
      data: { completedAt: now }
    });
  }

  return NextResponse.json({
    success: true,
    card: updatedCard,
    remainingDue
  });
}
