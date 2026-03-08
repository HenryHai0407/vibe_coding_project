import { redirect } from "next/navigation";
import { DashboardHome } from "@/components/auth/dashboard-home";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

function getMasteryState(averageRepetitionCount: number): "new" | "learning" | "unstable" | "familiar" | "strong" | "mastered" {
  if (averageRepetitionCount <= 0.25) return "new";
  if (averageRepetitionCount <= 1) return "learning";
  if (averageRepetitionCount <= 2) return "unstable";
  if (averageRepetitionCount <= 4) return "familiar";
  if (averageRepetitionCount <= 7) return "strong";
  return "mastered";
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const [
    dueCount,
    itemsAddedThisWeek,
    recentItems,
    recentReviewSessions,
    quizPracticeTurnsThisWeek,
    quizQuestionAttemptsThisWeek,
    quizCorrectThisWeek,
    firstReviewPendingCount,
    recentIncorrectAttempts
  ] = await Promise.all([
    db.reviewCard.count({
      where: {
        suspended: false,
        nextReviewAt: { lte: now },
        learningItem: {
          userId: session.user.id,
          archivedAt: null
        }
      }
    }),
    db.learningItem.count({
      where: {
        userId: session.user.id,
        createdAt: { gte: oneWeekAgo }
      }
    }),
    db.learningItem.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        finnishText: true,
        type: true,
        createdAt: true,
        reviewCards: {
          select: {
            repetitionCount: true
          }
        }
      }
    }),
    db.reviewSession.findMany({
      where: { userId: session.user.id },
      orderBy: { startedAt: "desc" },
      take: 6,
      select: {
        id: true,
        mode: true,
        startedAt: true,
        completedAt: true,
        _count: {
          select: { attempts: true }
        }
      }
    }),
    db.reviewSession.count({
      where: {
        userId: session.user.id,
        mode: "quiz",
        startedAt: { gte: oneWeekAgo }
      }
    }),
    db.reviewAttempt.count({
      where: {
        createdAt: { gte: oneWeekAgo },
        reviewSession: {
          userId: session.user.id,
          mode: "quiz"
        }
      }
    }),
    db.reviewAttempt.count({
      where: {
        createdAt: { gte: oneWeekAgo },
        result: "correct",
        reviewSession: {
          userId: session.user.id,
          mode: "quiz"
        }
      }
    }),
    db.reviewCard.count({
      where: {
        suspended: false,
        repetitionCount: 0,
        learningItem: {
          userId: session.user.id,
          archivedAt: null
        }
      }
    }),
    db.reviewAttempt.findMany({
      where: {
        createdAt: { gte: twoWeeksAgo },
        result: "incorrect",
        reviewSession: {
          userId: session.user.id,
          mode: "quiz"
        }
      },
      take: 120,
      orderBy: { createdAt: "desc" },
      select: {
        reviewCard: {
          select: {
            learningItem: {
              select: {
                id: true,
                finnishText: true,
                baseTranslation: true
              }
            }
          }
        }
      }
    })
  ]);

  const weakAreaMap = new Map<string, { id: string; finnishText: string; baseTranslation: string | null; mistakes: number }>();
  for (const attempt of recentIncorrectAttempts) {
    const item = attempt.reviewCard.learningItem;
    const current = weakAreaMap.get(item.id);
    if (!current) {
      weakAreaMap.set(item.id, { id: item.id, finnishText: item.finnishText, baseTranslation: item.baseTranslation, mistakes: 1 });
    } else {
      current.mistakes += 1;
    }
  }

  const weakAreas = Array.from(weakAreaMap.values())
    .sort((a, b) => b.mistakes - a.mistakes)
    .slice(0, 5);

  return (
    <DashboardHome
      user={session.user}
      summary={{
        dueCount,
        itemsAddedThisWeek,
        quizPracticeTurnsThisWeek,
        quizQuestionAttemptsThisWeek,
        quizCorrectThisWeek,
        firstReviewPendingCount,
        weakAreasCount: weakAreas.length
      }}
      weakAreas={weakAreas}
      recentItems={recentItems.map((item) => {
        const averageRepetitionCount =
          item.reviewCards.length > 0 ? item.reviewCards.reduce((sum, card) => sum + card.repetitionCount, 0) / item.reviewCards.length : 0;

        return {
          id: item.id,
          finnishText: item.finnishText,
          type: item.type,
          createdAt: item.createdAt,
          masteryState: getMasteryState(averageRepetitionCount)
        };
      })}
      recentSessions={recentReviewSessions.map((sessionItem) => ({
        id: sessionItem.id,
        mode: sessionItem.mode,
        startedAt: sessionItem.startedAt,
        completedAt: sessionItem.completedAt,
        attempts: sessionItem._count.attempts
      }))}
    />
  );
}
