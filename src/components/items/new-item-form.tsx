"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

type LearningItemType = "word" | "phrase" | "grammar" | "note";

type ExampleInput = {
  finnishSentence: string;
  englishTranslation: string;
  note: string;
};

type Tag = {
  id: string;
  name: string;
  color: string | null;
};

const defaultExample: ExampleInput = {
  finnishSentence: "",
  englishTranslation: "",
  note: ""
};

export function NewItemForm() {
  const router = useRouter();
  const [type, setType] = useState<LearningItemType>("word");
  const [finnishText, setFinnishText] = useState("");
  const [baseTranslation, setBaseTranslation] = useState("");
  const [explanation, setExplanation] = useState("");
  const [usageNote, setUsageNote] = useState("");
  const [sourceContext, setSourceContext] = useState("");
  const [difficulty, setDifficulty] = useState(2);
  const [examples, setExamples] = useState<ExampleInput[]>([{ ...defaultExample }]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    async function loadTags() {
      const response = await fetch("/api/tags");
      const data = (await response.json().catch(() => null)) as { tags?: Tag[] } | null;
      if (!cancelled && data?.tags) {
        setAvailableTags(data.tags);
      }
    }

    void loadTags();
    return () => {
      cancelled = true;
    };
  }, []);

  const hasExample = useMemo(() => examples.some((example) => example.finnishSentence.trim()), [examples]);

  const updateExample = (index: number, next: Partial<ExampleInput>) => {
    setExamples((current) => current.map((item, i) => (i === index ? { ...item, ...next } : item)));
  };

  const addExample = () => {
    setExamples((current) => [...current, { ...defaultExample }]);
  };

  const removeExample = (index: number) => {
    setExamples((current) => (current.length === 1 ? current : current.filter((_, i) => i !== index)));
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((current) => {
      const next = new Set(current);
      if (next.has(tagId)) next.delete(tagId);
      else next.add(tagId);
      return next;
    });
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!finnishText.trim()) {
      setError("Finnish text is required.");
      return;
    }

    setLoading(true);
    const response = await fetch("/api/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        type,
        finnishText,
        baseTranslation: baseTranslation.trim() || undefined,
        explanation: explanation.trim() || undefined,
        usageNote: usageNote.trim() || undefined,
        sourceContext: sourceContext.trim() || undefined,
        difficulty,
        examples: examples
          .filter((example) => example.finnishSentence.trim())
          .map((example) => ({
            finnishSentence: example.finnishSentence.trim(),
            englishTranslation: example.englishTranslation.trim() || undefined,
            note: example.note.trim() || undefined
          })),
        tagIds: Array.from(selectedTagIds)
      })
    });

    const data = (await response.json().catch(() => null)) as { message?: string; item?: { id: string } } | null;

    if (!response.ok || !data?.item?.id) {
      setLoading(false);
      setError(data?.message ?? "Unable to create learning item.");
      return;
    }

    router.push(`/items/${data.item.id}`);
    router.refresh();
  };

  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Create Learning Item</h1>
      <p className="mt-1 text-sm text-slate-600">Add Finnish vocabulary, phrase, grammar point, or note with context for later review.</p>

      <form className="mt-6 space-y-5" onSubmit={onSubmit}>
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

        <div className="space-y-2">
          <h2 className="text-sm font-semibold">Tags</h2>
          {availableTags.length === 0 ? (
            <p className="text-xs text-slate-500">No tags yet. Create tags from the Tags page.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => {
                const selected = selectedTagIds.has(tag.id);
                return (
                  <button
                    key={tag.id}
                    className={`rounded border px-3 py-1 text-sm ${selected ? "bg-slate-900 text-white" : ""}`}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Example sentences</h2>
            <button className="rounded border px-3 py-1 text-sm" onClick={addExample} type="button">
              + Add example
            </button>
          </div>

          {examples.map((example, index) => (
            <div key={index} className="space-y-2 rounded border p-3">
              <label className="block space-y-1">
                <span className="text-xs font-medium">Finnish sentence</span>
                <input
                  className="w-full rounded border px-3 py-2"
                  value={example.finnishSentence}
                  onChange={(event) => updateExample(index, { finnishSentence: event.target.value })}
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-medium">English translation</span>
                <input
                  className="w-full rounded border px-3 py-2"
                  value={example.englishTranslation}
                  onChange={(event) => updateExample(index, { englishTranslation: event.target.value })}
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-medium">Note</span>
                <input className="w-full rounded border px-3 py-2" value={example.note} onChange={(event) => updateExample(index, { note: event.target.value })} />
              </label>

              <div className="text-right">
                <button className="text-xs text-slate-600 underline" onClick={() => removeExample(index)} type="button">
                  Remove example
                </button>
              </div>
            </div>
          ))}

          {!hasExample ? <p className="text-xs text-slate-500">Add at least one example sentence for richer review cards later.</p> : null}
        </div>

        {error ? <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

        <button className="rounded bg-slate-900 px-4 py-2 font-semibold text-white disabled:opacity-60" type="submit" disabled={loading}>
          {loading ? "Creating item..." : "Create item"}
        </button>
      </form>
    </section>
  );
}
