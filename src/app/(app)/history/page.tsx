import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function HistoryPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [sessions, recentIncorrectQuizAttempts] = await Promise.all([
    db.reviewSession.findMany({
      where: { userId: session.user.id },
      orderBy: { startedAt: "desc" },
      take: 30,
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
    db.reviewAttempt.findMany({
      where: {
        result: "incorrect",
        reviewSession: {
          userId: session.user.id,
          mode: "quiz"
        }
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        createdAt: true,
        responseText: true,
        reviewCard: {
          select: {
            prompt: true,
            answer: true,
            learningItem: {
              select: {
                id: true,
                finnishText: true
              }
            }
          }
        }
      }
    })
  ]);

  return (
    <section className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
      <div>
        <h1 className="text-2xl font-semibold">History</h1>
        <p className="text-sm text-slate-600">Track your recent review and quiz activity, plus quiz mistakes for targeted practice.</p>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Recent sessions</h2>
        {sessions.length === 0 ? (
          <p className="text-sm text-slate-600">No sessions yet. Start a review or quiz session first.</p>
        ) : (
          <div className="overflow-x-auto rounded border">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2 font-medium">Mode</th>
                  <th className="px-3 py-2 font-medium">Started</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Attempts</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((sessionItem) => (
                  <tr key={sessionItem.id} className="border-t">
                    <td className="px-3 py-2 capitalize">{sessionItem.mode}</td>
                    <td className="px-3 py-2">{sessionItem.startedAt.toLocaleString()}</td>
                    <td className="px-3 py-2">{sessionItem.completedAt ? "Completed" : "In progress"}</td>
                    <td className="px-3 py-2">{sessionItem._count.attempts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Recent quiz mistakes</h2>
        {recentIncorrectQuizAttempts.length === 0 ? (
          <p className="text-sm text-slate-600">No incorrect quiz answers yet. Great work!</p>
        ) : (
          <ul className="space-y-2">
            {recentIncorrectQuizAttempts.map((attempt) => (
              <li key={attempt.id} className="rounded border p-3 text-sm">
                <p className="font-medium">{attempt.reviewCard.prompt}</p>
                <p className="text-slate-700">Your answer: {attempt.responseText ?? "(empty)"}</p>
                <p className="text-slate-700">Correct answer: {attempt.reviewCard.answer}</p>
                <p className="text-xs text-slate-500">
                  Item: {attempt.reviewCard.learningItem.finnishText} • {attempt.createdAt.toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
