import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="space-y-6 rounded-xl border bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-bold">Finnish Learning Workspace</h1>
      <p className="text-slate-700">Capture vocabulary and grammar, then review with flashcards and quizzes.</p>
      <div className="flex gap-3">
        <Link className="rounded bg-slate-900 px-4 py-2 text-white" href="/register">Create account</Link>
        <Link className="rounded border px-4 py-2" href="/login">Sign in</Link>
      </div>
    </div>
  );
}
