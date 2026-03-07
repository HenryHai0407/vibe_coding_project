import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { submitQuizSchema } from "@/server/schemas/quiz.schema";
import { isQuizAnswerCorrect } from "@/server/services/quiz.service";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = submitQuizSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid quiz submit payload." }, { status: 400 });
  }

  const quizSession = await db.reviewSession.findFirst({
    where: {
      id: parsed.data.reviewSessionId,
      userId: session.user.id,
      mode: "quiz",
      completedAt: null
    },
    select: { id: true }
  });

  if (!quizSession) {
    return NextResponse.json({ message: "Quiz session not found." }, { status: 404 });
  }

  const requestedCardIds = parsed.data.answers.map((answer) => answer.reviewCardId);
  const cards = await db.reviewCard.findMany({
    where: {
      id: { in: requestedCardIds },
      learningItem: {
        userId: session.user.id,
        archivedAt: null
      }
    },
    select: {
      id: true,
      answer: true,
      prompt: true
    }
  });

  const cardById = new Map(cards.map((card) => [card.id, card]));
  const now = new Date();

  const results = parsed.data.answers
    .map((answer) => {
      const card = cardById.get(answer.reviewCardId);
      if (!card) {
        return null;
      }

      const correct = isQuizAnswerCorrect(card.answer, answer.selectedAnswer);
      return {
        reviewCardId: card.id,
        prompt: card.prompt,
        selectedAnswer: answer.selectedAnswer,
        expectedAnswer: card.answer,
        correct,
        responseMs: answer.responseMs
      };
    })
    .filter((result): result is NonNullable<typeof result> => Boolean(result));

  if (results.length === 0) {
    return NextResponse.json({ message: "No valid quiz answers were submitted." }, { status: 400 });
  }

  await db.$transaction([
    db.reviewAttempt.createMany({
      data: results.map((result) => ({
        reviewSessionId: parsed.data.reviewSessionId,
        reviewCardId: result.reviewCardId,
        result: result.correct ? "correct" : "incorrect",
        responseText: result.selectedAnswer,
        responseMs: result.responseMs ?? null
      }))
    }),
    db.reviewSession.update({
      where: { id: parsed.data.reviewSessionId },
      data: { completedAt: now }
    })
  ]);

  const correct = results.filter((result) => result.correct).length;
  const total = results.length;

  return NextResponse.json({
    score: {
      correct,
      incorrect: total - correct,
      total
    },
    results
  });
}
