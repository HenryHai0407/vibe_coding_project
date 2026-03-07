"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type QuizQuestion = {
  reviewCardId: string;
  prompt: string;
  options: string[];
};

type QuizResult = {
  reviewCardId: string;
  prompt: string;
  selectedAnswer: string;
  expectedAnswer: string;
  correct: boolean;
};

type QuizSessionPayload = {
  session: { id: string };
  questions: QuizQuestion[];
  totalQuestions: number;
};

type QuizSessionProps = {
  sessionId: string;
};

export function QuizSession({ sessionId }: QuizSessionProps) {
  const [data, setData] = useState<QuizSessionPayload | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{ score: { correct: number; incorrect: number; total: number }; results: QuizResult[] } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = sessionStorage.getItem(`quiz:${sessionId}`);
    if (!raw) return;

    const parsed = JSON.parse(raw) as QuizSessionPayload;
    if (parsed?.session?.id === sessionId) {
      setData(parsed);
    }
  }, [sessionId]);

  const currentQuestion = data?.questions[index] ?? null;
  const selectedAnswer = currentQuestion ? answers[currentQuestion.reviewCardId] : undefined;
  const canSubmit = useMemo(() => {
    if (!data) return false;
    return data.questions.length > 0 && data.questions.every((question) => Boolean(answers[question.reviewCardId]));
  }, [answers, data]);

  const setAnswer = (reviewCardId: string, value: string) => {
    setAnswers((current) => ({ ...current, [reviewCardId]: value }));
  };

  const submitQuiz = async () => {
    if (!data || !canSubmit) return;

    setSubmitting(true);
    setError(null);

    const response = await fetch("/api/quiz/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reviewSessionId: sessionId,
        answers: data.questions.map((question) => ({
          reviewCardId: question.reviewCardId,
          selectedAnswer: answers[question.reviewCardId]
        }))
      })
    });

    const payload = (await response.json().catch(() => null)) as
      | { message?: string }
      | { score: { correct: number; incorrect: number; total: number }; results: QuizResult[] }
      | null;

    if (!response.ok || !payload || !("score" in payload)) {
      setSubmitting(false);
      setError((payload && "message" in payload && payload.message) || "Unable to submit quiz.");
      return;
    }

    if (typeof window !== "undefined") {
      sessionStorage.removeItem(`quiz:${sessionId}`);
    }

    setResults(payload);
    setSubmitting(false);
  };

  if (!data) {
    return (
      <section className="space-y-3 rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Quiz session</h1>
        <p className="text-sm text-slate-600">No quiz payload found. Start a new quiz from the Quiz page.</p>
        <Link className="inline-flex rounded border px-3 py-2 text-sm" href="/quiz">
          Back to quiz start
        </Link>
      </section>
    );
  }

  if (results) {
    return (
      <section className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Quiz results</h1>
        <p className="text-sm text-slate-700">
          Score: {results.score.correct}/{results.score.total}
        </p>

        <div className="space-y-2">
          {results.results.map((result) => (
            <div key={result.reviewCardId} className="rounded border p-3 text-sm">
              <p className="font-medium">{result.prompt}</p>
              <p className={result.correct ? "text-green-700" : "text-red-700"}>Your answer: {result.selectedAnswer}</p>
              {!result.correct ? <p className="text-slate-700">Correct answer: {result.expectedAnswer}</p> : null}
            </div>
          ))}
        </div>

        <Link className="inline-flex rounded border px-3 py-2 text-sm" href="/quiz">
          Start another quiz
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Quiz session</h1>

      {error ? <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      {currentQuestion ? (
        <div className="space-y-3 rounded border p-4">
          <p className="text-xs text-slate-500">
            Question {index + 1} / {data.questions.length}
          </p>
          <p className="text-base font-medium">{currentQuestion.prompt}</p>

          <div className="space-y-2">
            {currentQuestion.options.map((option) => {
              const checked = selectedAnswer === option;
              return (
                <label key={option} className={`flex cursor-pointer items-center gap-2 rounded border px-3 py-2 text-sm ${checked ? "bg-slate-100" : ""}`}>
                  <input checked={checked} name={currentQuestion.reviewCardId} onChange={() => setAnswer(currentQuestion.reviewCardId, option)} type="radio" />
                  <span>{option}</span>
                </label>
              );
            })}
          </div>

          <div className="flex gap-2">
            <button className="rounded border px-3 py-1 text-sm disabled:opacity-50" disabled={index === 0} onClick={() => setIndex((current) => current - 1)} type="button">
              Previous
            </button>
            <button
              className="rounded border px-3 py-1 text-sm disabled:opacity-50"
              disabled={index >= data.questions.length - 1}
              onClick={() => setIndex((current) => current + 1)}
              type="button"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}

      <button className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={!canSubmit || submitting} onClick={submitQuiz} type="button">
        {submitting ? "Submitting..." : "Submit quiz"}
      </button>
    </section>
  );
}
