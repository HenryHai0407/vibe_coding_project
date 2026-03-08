"use client";

import { PointerEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

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

const SWIPE_THRESHOLD_PX = 70;

export function ReviewSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [cards, setCards] = useState<ReviewCard[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragX, setDragX] = useState(0);

  const dragStartX = useRef<number | null>(null);

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

  const goNextCard = useCallback(() => {
    if (index < cards.length - 1) {
      setIndex((current) => current + 1);
      setRevealed(false);
      return;
    }

    setCards([]);
    setSessionId(null);
    setIndex(0);
    setRevealed(false);
  }, [cards.length, index]);

  const submitResult = useCallback(async (result: ReviewResult) => {
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

    goNextCard();
    setSubmitting(false);
  }, [currentCard, goNextCard, sessionId]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    dragStartX.current = event.clientX;
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null || !revealed || submitting) return;
    setDragX(event.clientX - dragStartX.current);
  };

  const onPointerUp = async () => {
    if (dragStartX.current === null) return;

    const deltaX = dragX;
    dragStartX.current = null;
    setDragX(0);

    if (!revealed || submitting) return;

    if (deltaX <= -SWIPE_THRESHOLD_PX) {
      await submitResult("hard");
      return;
    }

    if (deltaX >= SWIPE_THRESHOLD_PX) {
      await submitResult("easy");
    }
  };

  const rotation = Math.max(-12, Math.min(12, dragX / 10));


  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (submitting) return;

      if (event.key === " ") {
        event.preventDefault();
        if (currentCard) setRevealed((current) => !current);
        return;
      }

      if (!revealed || !currentCard || !sessionId) return;

      if (event.key === "1") void submitResult("again");
      if (event.key === "2") void submitResult("hard");
      if (event.key === "3") void submitResult("good");
      if (event.key === "4") void submitResult("easy");
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentCard, revealed, sessionId, submitResult, submitting]);

  return (
    <section className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Flashcard review</h1>
          <p className="text-sm text-slate-600">Practice due cards and update scheduling with Again / Hard / Good / Easy.</p>
          <p className="mt-1 text-xs text-slate-500">Tip: reveal then swipe left/right, or use keyboard (Space reveal, 1-4 to grade).</p>
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
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-slate-900 transition-all"
              style={{ width: `${cards.length === 0 ? 0 : (progress / cards.length) * 100}%` }}
            />
          </div>

          <div
            className="space-y-2 rounded border bg-slate-50 p-4 transition-transform duration-200 ease-out"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{ transform: `translateX(${dragX}px) rotate(${rotation}deg)` }}
          >
            <p className="text-sm text-slate-600">Prompt</p>
            <p className="text-lg font-medium text-slate-900">{currentCard.prompt}</p>
            {!revealed ? <p className="text-xs text-slate-500">Tap reveal first, then swipe left/right to grade quickly.</p> : null}
          </div>

          <button className="rounded border px-3 py-1 text-sm transition hover:bg-slate-100" onClick={() => setRevealed((current) => !current)} type="button">
            {revealed ? "Hide answer" : "Reveal answer"}
          </button>

          {revealed ? (
            <div className="rounded bg-slate-50 p-3 transition-all duration-200">
              <p className="text-xs uppercase tracking-wide text-slate-500">Answer</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{currentCard.answer}</p>
              <p className="mt-2 text-xs text-slate-600">
                Item: {currentCard.learningItem.finnishText}
                {currentCard.learningItem.baseTranslation ? ` — ${currentCard.learningItem.baseTranslation}` : ""}
              </p>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <button
              className="rounded border px-3 py-2 text-sm transition hover:bg-slate-100"
              disabled={!revealed || submitting}
              onClick={() => submitResult("again")}
              type="button"
            >
              Again (1)
            </button>
            <button
              className="rounded border px-3 py-2 text-sm transition hover:bg-slate-100"
              disabled={!revealed || submitting}
              onClick={() => submitResult("hard")}
              type="button"
            >
              Hard (2)
            </button>
            <button
              className="rounded border px-3 py-2 text-sm transition hover:bg-slate-100"
              disabled={!revealed || submitting}
              onClick={() => submitResult("good")}
              type="button"
            >
              Good (3)
            </button>
            <button
              className="rounded border px-3 py-2 text-sm transition hover:bg-slate-100"
              disabled={!revealed || submitting}
              onClick={() => submitResult("easy")}
              type="button"
            >
              Easy (4)
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
