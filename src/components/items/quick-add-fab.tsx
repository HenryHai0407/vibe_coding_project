"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function QuickAddFab() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [finnishText, setFinnishText] = useState("");
  const [baseTranslation, setBaseTranslation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const response = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "word",
        finnishText,
        baseTranslation: baseTranslation.trim() || undefined,
        difficulty: 2,
        tagIds: [],
        examples: []
      })
    });

    const data = (await response.json().catch(() => null)) as { item?: { id: string }; message?: string } | null;
    if (!response.ok || !data?.item?.id) {
      setError(data?.message ?? "Unable to quick-add item.");
      setLoading(false);
      return;
    }

    setLoading(false);
    setOpen(false);
    setFinnishText("");
    setBaseTranslation("");
    router.push(`/items/${data.item.id}`);
    router.refresh();
  };

  return (
    <>
      <button
        aria-label="Quick add item"
        className="fixed bottom-6 right-6 z-20 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-105"
        onClick={() => setOpen(true)}
        type="button"
      >
        + Quick Add
      </button>

      {open ? (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 p-4 sm:items-center" role="dialog" aria-modal="true">
          <form className="w-full max-w-md space-y-3 rounded-xl bg-white p-5 shadow-xl" onSubmit={onSubmit}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Quick capture</h2>
                <p className="text-sm text-slate-600">Capture first, enrich later.</p>
              </div>
              <button className="rounded border px-2 py-1 text-sm" onClick={() => setOpen(false)} type="button">
                Close
              </button>
            </div>

            <label className="block space-y-1">
              <span className="text-sm font-medium">Finnish text *</span>
              <input
                className="w-full rounded border px-3 py-2"
                onChange={(event) => setFinnishText(event.target.value)}
                required
                value={finnishText}
              />
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium">Quick translation</span>
              <input className="w-full rounded border px-3 py-2" onChange={(event) => setBaseTranslation(event.target.value)} value={baseTranslation} />
            </label>

            {error ? <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

            <button className="w-full rounded bg-slate-900 px-4 py-2 font-semibold text-white disabled:opacity-60" disabled={loading} type="submit">
              {loading ? "Saving..." : "Save item"}
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
