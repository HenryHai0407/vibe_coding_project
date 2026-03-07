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
    quizAttemptsThisWeek: number;
    quizCorrectThisWeek: number;
  };
  recentItems: Array<{
    id: string;
    finnishText: string;
    type: string;
    createdAt: Date;
  }>;
  recentSessions: Array<{
    id: string;
    mode: string;
    startedAt: Date;
    completedAt: Date | null;
    attempts: number;
  }>;
};

export function DashboardHome({ user, summary, recentItems, recentSessions }: DashboardHomeProps) {
  const quizAccuracy = summary.quizAttemptsThisWeek > 0 ? Math.round((summary.quizCorrectThisWeek / summary.quizAttemptsThisWeek) * 100) : null;

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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded border p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Due today</p>
          <p className="mt-2 text-2xl font-semibold">{summary.dueCount}</p>
        </div>
        <div className="rounded border p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Added this week</p>
          <p className="mt-2 text-2xl font-semibold">{summary.itemsAddedThisWeek}</p>
        </div>
        <div className="rounded border p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Quiz attempts (7d)</p>
          <p className="mt-2 text-2xl font-semibold">{summary.quizAttemptsThisWeek}</p>
        </div>
        <div className="rounded border p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Quiz accuracy</p>
          <p className="mt-2 text-2xl font-semibold">{quizAccuracy === null ? "-" : `${quizAccuracy}%`}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/items/new" className="rounded border p-4 hover:bg-slate-50">
          <p className="font-medium">+ Add learning item</p>
          <p className="text-sm text-slate-600">Start with a Finnish word or phrase.</p>
        </Link>
        <Link href="/review" className="rounded border p-4 hover:bg-slate-50">
          <p className="font-medium">Start review</p>
          <p className="text-sm text-slate-600">Practice due cards and keep momentum.</p>
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
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
                  <Link className="font-medium text-slate-900" href={`/items/${item.id}`}>
                    {item.finnishText}
                  </Link>
                  <p className="text-xs text-slate-600">
                    {item.type} • {item.createdAt.toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
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
      </div>
    </section>
  );
}
