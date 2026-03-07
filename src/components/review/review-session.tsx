"use client";

import { useMemo, useState } from "react";

type ReviewResult = "again" | "hard" | "good" | "easy";

type ReviewCard = {
  id: string;
  cardType: string;
  prompt: string;
  answer: string;
  learningItem: {
    id: string;
    type: string;
    finnishText: string;
    baseTranslation: string | null;
  };
};

type ReviewSessionPayload = {
  session: {
    id: string;
  };
  cards: ReviewCard[];
  totalCards: number;
};

export function ReviewSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [cards, setCards] = useState<ReviewCard[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentCard = cards[index] ?? null;
  const progress = useMemo(() => (cards.length === 0 ? 0 : index + 1), [cards.length, index]);

  const startSession = async () => {
    setLoading(true);
    setError(null);
    const response = await fetch("/api/review/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ limit: 20 })
    });

    const data = (await response.json().catch(() => null)) as ReviewSessionPayload | { message?: string } | null;
    if (!response.ok || !data || !("session" in data)) {
      setLoading(false);
      setError((data && "message" in data && data.message) || "Unable to start review session.");
      return;
    }

    setSessionId(data.session.id);
    setCards(data.cards);
    setIndex(0);
    setRevealed(false);
    setLoading(false);
  };

  const submitResult = async (result: ReviewResult) => {
    if (!sessionId || !currentCard) return;
    setSubmitting(true);
    setError(null);

    const response = await fetch("/api/review/attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reviewSessionId: sessionId,
        reviewCardId: currentCard.id,
        result
      })
    });

    const data = (await response.json().catch(() => null)) as { message?: string } | null;
    if (!response.ok) {
      setSubmitting(false);
      setError(data?.message ?? "Unable to submit review attempt.");
      return;
    }

    if (index < cards.length - 1) {
      setIndex((current) => current + 1);
      setRevealed(false);
    } else {
      setCards([]);
      setSessionId(null);
      setIndex(0);
      setRevealed(false);
    }

    setSubmitting(false);
  };

  return (
    <section className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Flashcard review</h1>
          <p className="text-sm text-slate-600">Practice due cards and update scheduling with Again / Hard / Good / Easy.</p>
        </div>
        <button
          className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          disabled={loading || submitting}
          onClick={startSession}
          type="button"
        >
          {loading ? "Starting..." : "Start session"}
        </button>
      </div>

      {error ? <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      {!currentCard ? (
        <p className="text-sm text-slate-600">No active session. Start a session to review due cards.</p>
      ) : (
        <div className="space-y-4 rounded border p-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{currentCard.cardType.replace("_", " ")}</span>
            <span>
              Card {progress} / {cards.length}
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-slate-600">Prompt</p>
            <p className="text-lg font-medium text-slate-900">{currentCard.prompt}</p>
          </div>

          <button className="rounded border px-3 py-1 text-sm" onClick={() => setRevealed((current) => !current)} type="button">
            {revealed ? "Hide answer" : "Reveal answer"}
          </button>

          {revealed ? (
            <div className="rounded bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Answer</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{currentCard.answer}</p>
              <p className="mt-2 text-xs text-slate-600">
                Item: {currentCard.learningItem.finnishText}
                {currentCard.learningItem.baseTranslation ? ` — ${currentCard.learningItem.baseTranslation}` : ""}
              </p>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <button className="rounded border px-3 py-2 text-sm" disabled={!revealed || submitting} onClick={() => submitResult("again")} type="button">
              Again
            </button>
            <button className="rounded border px-3 py-2 text-sm" disabled={!revealed || submitting} onClick={() => submitResult("hard")} type="button">
              Hard
            </button>
            <button className="rounded border px-3 py-2 text-sm" disabled={!revealed || submitting} onClick={() => submitResult("good")} type="button">
              Good
            </button>
            <button className="rounded border px-3 py-2 text-sm" disabled={!revealed || submitting} onClick={() => submitResult("easy")} type="button">
              Easy
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
