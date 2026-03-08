import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { QuickAddFab } from "@/components/items/quick-add-fab";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <header className="rounded-xl border bg-white px-4 py-3 shadow-sm">
        <nav className="flex flex-wrap gap-2 text-sm">
          <Link className="rounded px-3 py-1.5 hover:bg-slate-100" href="/dashboard">
            Dashboard
          </Link>
          <Link className="rounded px-3 py-1.5 hover:bg-slate-100" href="/items">
            Items
          </Link>
          <Link className="rounded px-3 py-1.5 hover:bg-slate-100" href="/review">
            Review
          </Link>
          <Link className="rounded px-3 py-1.5 hover:bg-slate-100" href="/quiz">
            Quiz
          </Link>
          <Link className="rounded px-3 py-1.5 hover:bg-slate-100" href="/history">
            History
          </Link>
          <Link className="rounded px-3 py-1.5 hover:bg-slate-100" href="/tags">
            Tags
          </Link>
          <Link className="rounded px-3 py-1.5 hover:bg-slate-100" href="/settings">
            Settings
          </Link>
        </nav>
      </header>
      {children}
      <QuickAddFab />
    </div>
  );
}
