"use client";

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800 shadow-sm">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p>Please try again. If the issue continues, refresh the page.</p>
      <button className="rounded border border-red-300 bg-white px-3 py-2 text-sm font-medium" onClick={() => reset()} type="button">
        Try again
      </button>
    </section>
  );
}
