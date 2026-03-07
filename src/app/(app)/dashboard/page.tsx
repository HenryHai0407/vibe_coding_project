import { redirect } from "next/navigation";
import { DashboardHome } from "@/components/auth/dashboard-home";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [dueCount, itemsAddedThisWeek, recentItems, recentReviewSessions, quizAttemptsThisWeek, quizCorrectThisWeek] = await Promise.all([
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
        createdAt: true
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
    })
  ]);

  return (
    <DashboardHome
      user={session.user}
      summary={{
        dueCount,
        itemsAddedThisWeek,
        quizAttemptsThisWeek,
        quizCorrectThisWeek
      }}
      recentItems={recentItems}
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
