"use client";

import { FormEvent, useState } from "react";

type Example = {
  id: string;
  finnishSentence: string;
  englishTranslation: string | null;
  note: string | null;
};

type ItemExamplesManagerProps = {
  itemId: string;
  initialExamples: Example[];
};

export function ItemExamplesManager({ itemId, initialExamples }: ItemExamplesManagerProps) {
  const [examples, setExamples] = useState(initialExamples);
  const [finnishSentence, setFinnishSentence] = useState("");
  const [englishTranslation, setEnglishTranslation] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const addExample = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const response = await fetch(`/api/items/${itemId}/examples`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ finnishSentence, englishTranslation, note })
    });

    const data = (await response.json().catch(() => null)) as { example?: Example; message?: string } | null;
    if (!response.ok || !data?.example) {
      setError(data?.message ?? "Unable to add example.");
      return;
    }

    const createdExample = data.example;
    setExamples((current) => [...current, createdExample]);
    setFinnishSentence("");
    setEnglishTranslation("");
    setNote("");
  };


  const editExample = async (example: Example) => {
    const nextFinnish = window.prompt("Finnish sentence", example.finnishSentence);
    if (nextFinnish === null) return;

    const nextEnglish = window.prompt("English translation", example.englishTranslation ?? "");
    if (nextEnglish === null) return;

    const nextNote = window.prompt("Note", example.note ?? "");
    if (nextNote === null) return;

    setError(null);
    const response = await fetch(`/api/examples/${example.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        finnishSentence: nextFinnish,
        englishTranslation: nextEnglish,
        note: nextNote
      })
    });

    const data = (await response.json().catch(() => null)) as { example?: Example; message?: string } | null;
    if (!response.ok || !data?.example) {
      setError(data?.message ?? "Unable to update example.");
      return;
    }

    const updatedExample = data.example;
    setExamples((current) => current.map((item) => (item.id === example.id ? updatedExample : item)));
  };

  const deleteExample = async (exampleId: string) => {
    setError(null);
    const response = await fetch(`/api/examples/${exampleId}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Unable to delete example.");
      return;
    }

    setExamples((current) => current.filter((example) => example.id !== exampleId));
  };

  return (
    <div className="space-y-3">
      {examples.length === 0 ? (
        <p className="text-sm text-slate-600">No examples added.</p>
      ) : (
        <ul className="space-y-2">
          {examples.map((example) => (
            <li key={example.id} className="rounded border p-3 text-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{example.finnishSentence}</p>
                  {example.englishTranslation ? <p className="text-slate-600">{example.englishTranslation}</p> : null}
                  {example.note ? <p className="text-xs text-slate-500">{example.note}</p> : null}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <button className="text-xs text-slate-700 underline" onClick={() => editExample(example)} type="button">
                    Edit
                  </button>
                  <button className="text-xs text-red-700 underline" onClick={() => deleteExample(example.id)} type="button">
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form className="grid gap-2 rounded border p-3" onSubmit={addExample}>
        <input
          className="rounded border px-3 py-2 text-sm"
          placeholder="Finnish sentence"
          value={finnishSentence}
          onChange={(event) => setFinnishSentence(event.target.value)}
          required
        />
        <input
          className="rounded border px-3 py-2 text-sm"
          placeholder="English translation (optional)"
          value={englishTranslation}
          onChange={(event) => setEnglishTranslation(event.target.value)}
        />
        <input className="rounded border px-3 py-2 text-sm" placeholder="Note (optional)" value={note} onChange={(event) => setNote(event.target.value)} />
        <button className="rounded bg-slate-900 px-3 py-2 text-sm font-semibold text-white" type="submit">
          Add example
        </button>
      </form>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
