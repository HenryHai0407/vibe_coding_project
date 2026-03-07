import Link from "next/link";
import { signOut } from "@/lib/auth";

type DashboardHomeProps = {
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
  };
};

export function DashboardHome({ user }: DashboardHomeProps) {
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
    </section>
  );
}
