import type { ReactNode } from "react";

export function PagePlaceholder({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <section className="space-y-3 rounded-xl border bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {children ? <div className="text-slate-700">{children}</div> : <p className="text-slate-600">MVP page scaffolded.</p>}
    </section>
  );
}
