"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type QuizStartResponse = {
  session: { id: string };
  questions: Array<{
    reviewCardId: string;
    prompt: string;
    options: string[];
  }>;
  totalQuestions: number;
};

export function QuizStart() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startQuiz = async () => {
    setLoading(true);
    setError(null);

    const response = await fetch("/api/quiz/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ limit: 10 })
    });

    const data = (await response.json().catch(() => null)) as QuizStartResponse | { message?: string } | null;
    if (!response.ok || !data || !("session" in data)) {
      setLoading(false);
      setError((data && "message" in data && data.message) || "Unable to start quiz.");
      return;
    }

    if (typeof window !== "undefined") {
      sessionStorage.setItem(`quiz:${data.session.id}`, JSON.stringify(data));
    }

    router.push(`/quiz/session/${data.session.id}`);
    router.refresh();
  };

  return (
    <section className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Quiz mode</h1>
      <p className="text-sm text-slate-600">Answer multiple-choice questions generated from your review cards.</p>

      {error ? <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <button className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" disabled={loading} onClick={startQuiz} type="button">
        {loading ? "Starting quiz..." : "Start quiz"}
      </button>
    </section>
  );
}
