import Link from "next/link";

export default function LandingPage() {
  return (
    <section className="space-y-8 rounded-xl border bg-white p-8 shadow-sm">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold">Finnish Learning Workspace</h1>
        <p className="max-w-2xl text-slate-700">
          Capture vocabulary, organize examples, and review with flashcards. This tester version now includes a working sign up and sign in flow.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link className="rounded bg-slate-900 px-4 py-2 font-semibold text-white" href="/register">
          Create account
        </Link>
        <Link className="rounded border px-4 py-2 font-semibold" href="/login">
          Sign in
        </Link>
      </div>

      <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
        <div className="rounded border p-3">1) Create account</div>
        <div className="rounded border p-3">2) Sign in</div>
        <div className="rounded border p-3">3) Access dashboard</div>
      </div>
    </section>
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
