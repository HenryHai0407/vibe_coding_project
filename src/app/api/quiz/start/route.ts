import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { startQuizSchema } from "@/server/schemas/quiz.schema";
import { buildQuizQuestions } from "@/server/services/quiz.service";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = startQuizSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid quiz start payload." }, { status: 400 });
  }

  const cards = await db.reviewCard.findMany({
    where: {
      suspended: false,
      learningItem: {
        userId: session.user.id,
        archivedAt: null
      }
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    take: parsed.data.limit,
    select: {
      id: true,
      prompt: true,
      answer: true
    }
  });

  const createdSession = await db.reviewSession.create({
    data: {
      userId: session.user.id,
      mode: "quiz"
    },
    select: {
      id: true,
      startedAt: true,
      mode: true
    }
  });

  const questions = buildQuizQuestions(cards);

  return NextResponse.json({
    session: createdSession,
    questions,
    totalQuestions: questions.length
  });
}
