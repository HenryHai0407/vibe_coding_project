import Link from "next/link";
import { signOut } from "@/lib/auth";

type DashboardHomeProps = {
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
  };
  summary: {
    dueCount: number;
    itemsAddedThisWeek: number;
    quizPracticeTurnsThisWeek: number;
    quizQuestionAttemptsThisWeek: number;
    quizCorrectThisWeek: number;
    firstReviewPendingCount: number;
    weakAreasCount: number;
  };
  weakAreas: Array<{
    id: string;
    finnishText: string;
    baseTranslation: string | null;
    mistakes: number;
  }>;
  recentItems: Array<{
    id: string;
    finnishText: string;
    type: string;
    createdAt: Date;
    masteryState: "new" | "learning" | "unstable" | "familiar" | "strong" | "mastered";
  }>;
  recentSessions: Array<{
    id: string;
    mode: string;
    startedAt: Date;
    completedAt: Date | null;
    attempts: number;
  }>;
};

const masteryStyles: Record<DashboardHomeProps["recentItems"][number]["masteryState"], string> = {
  new: "bg-slate-100 text-slate-700",
  learning: "bg-blue-100 text-blue-700",
  unstable: "bg-amber-100 text-amber-700",
  familiar: "bg-emerald-100 text-emerald-700",
  strong: "bg-green-100 text-green-700",
  mastered: "bg-violet-100 text-violet-700"
};

export function DashboardHome({ user, summary, weakAreas, recentItems, recentSessions }: DashboardHomeProps) {
  const quizAccuracy = summary.quizQuestionAttemptsThisWeek > 0 ? Math.round((summary.quizCorrectThisWeek / summary.quizQuestionAttemptsThisWeek) * 100) : null;

  return (
    <section className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Welcome, {user.name ?? user.email} 👋</h1>
          <p className="text-slate-700">Signed in as {user.email}.</p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button className="rounded border px-3 py-2 text-sm font-medium" type="submit">
            Sign out
          </button>
        </form>
      </div>

      <div className="rounded border bg-slate-50 p-4">
        <h2 className="text-lg font-semibold">Today plan</h2>
        <p className="text-sm text-slate-600">A focused set to keep momentum with clear next actions.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded border bg-white p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Due reviews</p>
            <p className="mt-1 text-xl font-semibold">{summary.dueCount}</p>
          </div>
          <div className="rounded border bg-white p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Needs first review</p>
            <p className="mt-1 text-xl font-semibold">{summary.firstReviewPendingCount}</p>
          </div>
          <div className="rounded border bg-white p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Weak areas</p>
            <p className="mt-1 text-xl font-semibold">{summary.weakAreasCount}</p>
          </div>
          <div className="rounded border bg-white p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Added this week</p>
            <p className="mt-1 text-xl font-semibold">{summary.itemsAddedThisWeek}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded border p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Quiz practice turns (7d)</p>
          <p className="mt-2 text-2xl font-semibold">{summary.quizPracticeTurnsThisWeek}</p>
        </div>
        <div className="rounded border p-4 sm:col-span-2">
          <p className="text-xs uppercase tracking-wide text-slate-500">Quiz accuracy (question-level)</p>
          <p className="mt-2 text-2xl font-semibold">{quizAccuracy === null ? "-" : `${quizAccuracy}%`}</p>
          <p className="mt-1 text-xs text-slate-600">
            {summary.quizCorrectThisWeek}/{summary.quizQuestionAttemptsThisWeek} correct
          </p>
        </div>
        <div className="rounded border p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Quick focus</p>
          <p className="mt-2 text-sm text-slate-700">Run review first, then a short quiz session.</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/review" className="rounded border p-4 hover:bg-slate-50">
          <p className="font-medium">Continue review</p>
          <p className="text-sm text-slate-600">Practice due cards with swipe or grading buttons.</p>
        </Link>
        <Link href="/quiz" className="rounded border p-4 hover:bg-slate-50">
          <p className="font-medium">Start quick quiz</p>
          <p className="text-sm text-slate-600">Train recall and revisit mistakes from recent attempts.</p>
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2 rounded border p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Weak areas (last 14 days)</h2>
            <Link className="text-sm text-slate-600 underline" href="/history">
              Review mistakes
            </Link>
          </div>

          {weakAreas.length === 0 ? (
            <p className="text-sm text-slate-600">No recent quiz mistakes. Great consistency.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {weakAreas.map((area) => (
                <li key={area.id} className="rounded border p-2">
                  <Link className="font-medium text-slate-900" href={`/items/${area.id}`}>
                    {area.finnishText}
                  </Link>
                  <p className="text-xs text-slate-600">
                    {area.baseTranslation ?? "No translation"} • {area.mistakes} mistake{area.mistakes > 1 ? "s" : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-2 rounded border p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent items</h2>
            <Link className="text-sm text-slate-600 underline" href="/items">
              View all
            </Link>
          </div>

          {recentItems.length === 0 ? (
            <p className="text-sm text-slate-600">No learning items yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {recentItems.map((item) => (
                <li key={item.id} className="rounded border p-2">
                  <div className="flex items-center justify-between gap-2">
                    <Link className="font-medium text-slate-900" href={`/items/${item.id}`}>
                      {item.finnishText}
                    </Link>
                    <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${masteryStyles[item.masteryState]}`}>{item.masteryState}</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {item.type} • {item.createdAt.toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="space-y-2 rounded border p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Recent sessions</h2>
          <Link className="text-sm text-slate-600 underline" href="/history">
            Full history
          </Link>
        </div>

        {recentSessions.length === 0 ? (
          <p className="text-sm text-slate-600">No review or quiz sessions yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {recentSessions.map((session) => (
              <li key={session.id} className="rounded border p-2">
                <p className="font-medium capitalize">{session.mode}</p>
                <p className="text-xs text-slate-600">
                  {session.attempts} attempts • {session.startedAt.toLocaleString()}
                </p>
                <p className="text-xs text-slate-600">{session.completedAt ? "Completed" : "In progress"}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
