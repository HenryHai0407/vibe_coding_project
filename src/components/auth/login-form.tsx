"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { signIn } from "next-auth/react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const registeredMessage = useMemo(() => {
    return searchParams.get("registered") === "1" ? "Account created. Please sign in." : null;
  }, [searchParams]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    setLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/dashboard"
    });

    if (!result || result.error) {
      setLoading(false);
      setError("Invalid email or password.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <section className="mx-auto w-full max-w-xl rounded-xl border bg-white p-6 shadow-sm">
      <h1 className="text-3xl font-bold">Sign in</h1>
      <p className="mt-2 text-sm text-slate-600">Welcome back. Continue your Finnish learning journey.</p>

      {registeredMessage ? (
        <p className="mt-4 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">{registeredMessage}</p>
      ) : null}

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Email</span>
          <input
            className="w-full rounded border px-3 py-2"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            placeholder="you@example.com"
            required
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Password</span>
          <input
            className="w-full rounded border px-3 py-2"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            minLength={8}
            required
          />
        </label>

        {error ? <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

        <button
          className="w-full rounded bg-slate-900 px-4 py-2 font-semibold text-white disabled:opacity-60"
          type="submit"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-700">
        No account yet?{" "}
        <Link href="/register" className="font-medium text-slate-900 underline">
          Create one
        </Link>
      </p>
    </section>
  );
}
