"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type LearningItemType = "word" | "phrase" | "grammar" | "note";

type EditItemFormProps = {
  item: {
    id: string;
    type: LearningItemType;
    finnishText: string;
    baseTranslation: string | null;
    explanation: string | null;
    usageNote: string | null;
    sourceContext: string | null;
    difficulty: number;
  };
};

export function EditItemForm({ item }: EditItemFormProps) {
  const router = useRouter();
  const [type, setType] = useState<LearningItemType>(item.type);
  const [finnishText, setFinnishText] = useState(item.finnishText);
  const [baseTranslation, setBaseTranslation] = useState(item.baseTranslation ?? "");
  const [explanation, setExplanation] = useState(item.explanation ?? "");
  const [usageNote, setUsageNote] = useState(item.usageNote ?? "");
  const [sourceContext, setSourceContext] = useState(item.sourceContext ?? "");
  const [difficulty, setDifficulty] = useState(item.difficulty);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!finnishText.trim()) {
      setError("Finnish text is required.");
      return;
    }

    setLoading(true);
    const response = await fetch(`/api/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        finnishText,
        baseTranslation,
        explanation,
        usageNote,
        sourceContext,
        difficulty
      })
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      setLoading(false);
      setError(data?.message ?? "Unable to update item.");
      return;
    }

    router.push(`/items/${item.id}`);
    router.refresh();
  };

  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Edit Learning Item</h1>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-medium">Type</span>
            <select className="w-full rounded border px-3 py-2" value={type} onChange={(event) => setType(event.target.value as LearningItemType)}>
              <option value="word">Word</option>
              <option value="phrase">Phrase</option>
              <option value="grammar">Grammar</option>
              <option value="note">Note</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Difficulty (1-5)</span>
            <input
              className="w-full rounded border px-3 py-2"
              type="number"
              min={1}
              max={5}
              value={difficulty}
              onChange={(event) => setDifficulty(Number(event.target.value) || 2)}
            />
          </label>
        </div>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Finnish text *</span>
          <input className="w-full rounded border px-3 py-2" value={finnishText} onChange={(event) => setFinnishText(event.target.value)} />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Base translation</span>
          <input className="w-full rounded border px-3 py-2" value={baseTranslation} onChange={(event) => setBaseTranslation(event.target.value)} />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Explanation</span>
          <textarea className="w-full rounded border px-3 py-2" rows={3} value={explanation} onChange={(event) => setExplanation(event.target.value)} />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-medium">Usage note</span>
            <input className="w-full rounded border px-3 py-2" value={usageNote} onChange={(event) => setUsageNote(event.target.value)} />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Source context</span>
            <input className="w-full rounded border px-3 py-2" value={sourceContext} onChange={(event) => setSourceContext(event.target.value)} />
          </label>
        </div>

        {error ? <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

        <button className="rounded bg-slate-900 px-4 py-2 font-semibold text-white disabled:opacity-60" type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save changes"}
        </button>
      </form>
    </section>
  );
}
